from utils import read_video, save_video
from trackers import Tracker
import cv2
import numpy as np
from team_assigner import TeamAssigner
from player_ball_assigner import PlayerBallAssigner
from camera_movement_estimator import CameraMovementEstimator
from view_transformer import ViewTransformer
from speed_and_distance_estimator import SpeedAndDistance_Estimator


def main():
    # Read Video
    video_frames = read_video('input_videos/08fd33_4.mp4')

    # Initialize Tracker
    tracker = Tracker('models/best.pt')

    tracks = tracker.get_object_tracks(video_frames,
                                       read_from_stub=True,
                                       stub_path='stubs/track_stubs.pkl')
    # Get object positions 
    tracker.add_position_to_tracks(tracks)

    # camera movement estimator
    camera_movement_estimator = CameraMovementEstimator(video_frames[0])
    camera_movement_per_frame = camera_movement_estimator.get_camera_movement(video_frames,
                                                                                read_from_stub=True,
                                                                                stub_path='stubs/camera_movement_stub.pkl')
    camera_movement_estimator.add_adjust_positions_to_tracks(tracks,camera_movement_per_frame)


    # View Trasnformer
    view_transformer = ViewTransformer()
    view_transformer.add_transformed_position_to_tracks(tracks)

    # Interpolate Ball Positions
    tracks["ball"] = tracker.interpolate_ball_positions(tracks["ball"])

    # Speed and distance estimator
    speed_and_distance_estimator = SpeedAndDistance_Estimator()
    speed_and_distance_estimator.add_speed_and_distance_to_tracks(tracks)

    # Assign Player Teams
    team_assigner = TeamAssigner()
    team_assigner.assign_team_color(video_frames[0], 
                                    tracks['players'][0])
    
    for frame_num, player_track in enumerate(tracks['players']):
        for player_id, track in player_track.items():
            team = team_assigner.get_player_team(video_frames[frame_num],   
                                                 track['bbox'],
                                                 player_id)
            tracks['players'][frame_num][player_id]['team'] = team 
            tracks['players'][frame_num][player_id]['team_color'] = team_assigner.team_colors[team]

    
    # Assign Ball Aquisition
    player_assigner =PlayerBallAssigner()
    team_ball_control= []
    individual_ball_control = {} # ADDED: track frames per player ID
    
    for frame_num, player_track in enumerate(tracks['players']):
        ball_bbox = tracks['ball'][frame_num][1]['bbox']
        assigned_player = player_assigner.assign_ball_to_player(player_track, ball_bbox)

        if assigned_player != -1:
            tracks['players'][frame_num][assigned_player]['has_ball'] = True
            team_ball_control.append(tracks['players'][frame_num][assigned_player]['team'])
            
            # ADDED: log individual possession frames
            if assigned_player not in individual_ball_control:
                individual_ball_control[assigned_player] = 0
            individual_ball_control[assigned_player] += 1
        else:
            # If no player has the ball, assign it to the last team that had it
            if len(team_ball_control) > 0:
                team_ball_control.append(team_ball_control[-1])
            else:
                team_ball_control.append(0) # fallback
    team_ball_control= np.array(team_ball_control)


    # Draw output 
    ## Draw object Tracks
    output_video_frames = tracker.draw_annotations(video_frames, tracks,team_ball_control)

    ## Draw Camera movement
    output_video_frames = camera_movement_estimator.draw_camera_movement(output_video_frames,camera_movement_per_frame)

    ## Draw Speed and Distance
    speed_and_distance_estimator.draw_speed_and_distance(output_video_frames,tracks)

    # Save video
    save_video(output_video_frames, 'output_videos/output_video.avi')

    # ADDED: Export Tactical Data to JSON
    import json
    
    tactical_stats = {
        "team_possession": {},
        "players": []
    }
    
    # Calculate team possession
    team_1_frames = np.sum(team_ball_control == 1)
    team_2_frames = np.sum(team_ball_control == 2)
    total_frames_with_possession = team_1_frames + team_2_frames
    
    if total_frames_with_possession > 0:
        tactical_stats["team_possession"]["team_1"] = f"{(team_1_frames / total_frames_with_possession) * 100:.1f}%"
        tactical_stats["team_possession"]["team_2"] = f"{(team_2_frames / total_frames_with_possession) * 100:.1f}%"
    
    # Aggregate player physical metrics
    player_stats = {}
    fps = 24 # from speed_and_distance_estimator
    
    for frame_num, player_track in enumerate(tracks['players']):
        for player_id, track in player_track.items():
            if player_id not in player_stats:
                player_stats[player_id] = {
                    "id": player_id,
                    "team": track.get('team', 0),
                    "top_speed_kmh": 0.0,
                    "distance_covered_m": 0.0,
                    "time_on_ball_s": 0.0
                }
            
            # Update top speed
            current_speed = track.get('speed', 0.0)
            if current_speed > player_stats[player_id]["top_speed_kmh"]:
                player_stats[player_id]["top_speed_kmh"] = round(current_speed, 2)
                
            # Update max distance covered (it is a running total in the track)
            current_distance = track.get('distance', 0.0)
            if current_distance > player_stats[player_id]["distance_covered_m"]:
                player_stats[player_id]["distance_covered_m"] = round(current_distance, 2)
    
    # Add time on ball
    for player_id, frames in individual_ball_control.items():
        if player_id in player_stats:
            player_stats[player_id]["time_on_ball_s"] = round(frames / fps, 2)
            
    tactical_stats["players"] = list(player_stats.values())
    
    with open('tactical_stats.json', 'w') as f:
        json.dump(tactical_stats, f, indent=4)
    print("Exported tactical stats to tactical_stats.json")

if __name__ == '__main__':
    main()