const crypto = require('crypto');
const { query } = require('../config/db');

// Helper to generate 24-hex-char unique IDs compatible with MongoDB ObjectId format
function generateObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

// Convert DB row into standard document object
function rowToDoc(row, tableName, ModelClass) {
  if (!row) return null;

  const data = row.data && typeof row.data === 'object' ? row.data : {};
  const docId = row.id;

  const docData = {
    _id: docId,
    id: docId,
    createdAt: row.created_at || data.createdAt || new Date(),
    updatedAt: row.updated_at || data.updatedAt || new Date(),
    ...data
  };

  // Ensure top-level columns override or default properly
  if (row.email) docData.email = row.email;
  if (row.password) docData.password = row.password;
  if (row.role) docData.role = row.role;
  if (row.user_id) docData.user = row.user_id;
  if (row.name) docData.name = row.name;
  if (row.title) docData.title = row.title;
  if (row.url) docData.url = row.url;
  if (row.drill_type) docData.drillType = row.drill_type;
  if (row.video_id) docData.video = row.video_id;
  if (row.chat_id) docData.chat = row.chat_id;
  if (row.sender_id) docData.sender = row.sender_id;
  if (row.post_id) docData.post = row.post_id;
  if (row.follower_id) docData.follower = row.follower_id;
  if (row.tournament_id) docData.tournament = row.tournament_id;
  if (row.scout_id) docData.scout = row.scout_id;
  if (row.player_id) docData.player = row.player_id;
  if (row.trial_id) docData.trial = row.trial_id;
  if (row.type) docData.type = row.type;
  if (row.message) docData.message = row.message;

  if (ModelClass) {
    return new ModelClass(docData);
  }

  return docData;
}

// SQL Query helper for update
async function updateDocument(tableName, id, updates) {
  const currentRes = await query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
  if (currentRes.rows.length === 0) {
    throw new Error(`Record not found in ${tableName} with id ${id}`);
  }

  const existingRow = currentRes.rows[0];
  const existingData = existingRow.data || {};

  const cleanUpdates = { ...updates };
  delete cleanUpdates._id;
  delete cleanUpdates.id;

  const newData = { ...existingData, ...cleanUpdates, updatedAt: new Date() };

  const cols = [];
  const vals = [JSON.stringify(newData), id];

  if (cleanUpdates.email) {
    vals.push(cleanUpdates.email.toLowerCase());
    cols.push(`email = $${vals.length}`);
  }
  if (cleanUpdates.password) {
    vals.push(cleanUpdates.password);
    cols.push(`password = $${vals.length}`);
  }
  if (cleanUpdates.role) {
    vals.push(cleanUpdates.role);
    cols.push(`role = $${vals.length}`);
  }
  if (cleanUpdates.user) {
    vals.push(cleanUpdates.user);
    cols.push(`user_id = $${vals.length}`);
  }
  if (cleanUpdates.name) {
    vals.push(cleanUpdates.name);
    cols.push(`name = $${vals.length}`);
  }

  const sql = `
    UPDATE ${tableName}
    SET data = $1, updated_at = NOW() ${cols.length ? ', ' + cols.join(', ') : ''}
    WHERE id = $2
    RETURNING *;
  `;

  const res = await query(sql, vals);
  return rowToDoc(res.rows[0], tableName);
}

// Nested property getter for Mongo-style dot notation (e.g. "applicants.player")
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  if (obj[path] !== undefined) return obj[path];

  const parts = path.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr === null || curr === undefined) return undefined;
    if (Array.isArray(curr)) {
      const vals = curr.map(item => item ? item[p] : undefined).filter(v => v !== undefined);
      return vals.length ? vals : undefined;
    }
    curr = curr[p];
  }
  return curr;
}

// In-Memory Filter Matcher for Mongo queries ($or, $in, $ne, $gte, $lte, regex, dot notation)
function matchesFilter(doc, filter) {
  if (!filter || typeof filter !== 'object' || Object.keys(filter).length === 0) return true;

  if (filter.$or && Array.isArray(filter.$or)) {
    const matchOr = filter.$or.some(subFilter => matchesFilter(doc, subFilter));
    if (!matchOr) return false;
  }

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or') continue;

    const docVal = getNestedValue(doc, key);

    if (val !== undefined && val !== null) {
      if (typeof val === 'object' && !Array.isArray(val)) {
        if (val.$in && Array.isArray(val.$in)) {
          const valStrList = val.$in.map(v => String(v._id || v.id || v));
          if (Array.isArray(docVal)) {
            const hasMatch = docVal.some(item => valStrList.includes(String(item._id || item.id || item)));
            if (!hasMatch) return false;
          } else {
            const docStr = String(docVal?._id || docVal?.id || docVal);
            if (!valStrList.includes(docStr)) return false;
          }
        } else if (val.$ne !== undefined) {
          const docStr = String(docVal?._id || docVal?.id || docVal);
          const neStr = String(val.$ne._id || val.$ne.id || val.$ne);
          if (docStr === neStr) return false;
        } else if (val.$gte !== undefined || val.$lte !== undefined) {
          const numDoc = Number(docVal) || 0;
          if (val.$gte !== undefined && numDoc < Number(val.$gte)) return false;
          if (val.$lte !== undefined && numDoc > Number(val.$lte)) return false;
        } else if (val instanceof RegExp) {
          if (!val.test(String(docVal || ''))) return false;
        }
      } else if (Array.isArray(docVal)) {
        const targetStr = String(val._id || val.id || val);
        const hasMatch = docVal.some(item => {
          const itemStr = String(item.player || item.user || item._id || item.id || item);
          return itemStr.toLowerCase() === targetStr.toLowerCase();
        });
        if (!hasMatch) return false;
      } else {
        const targetStr = String(val._id || val.id || val);
        const docStr = String(docVal?._id || docVal?.id || docVal);
        if (docStr.toLowerCase() !== targetStr.toLowerCase()) return false;
      }
    }
  }

  return true;
}

// Chainable Query Builder for Mongoose Query compatibility
class PostgresQueryBuilder {
  constructor(tableName, filter = {}, ModelClass = null) {
    this.tableName = tableName;
    this.filter = filter;
    this.ModelClass = ModelClass;
    this.sortOption = null;
    this.limitOption = null;
    this.skipOption = null;
    this.selectOptions = null;
    this.populateOptions = [];
  }

  sort(sortOpt) {
    this.sortOption = sortOpt;
    return this;
  }

  limit(lim) {
    this.limitOption = lim;
    return this;
  }

  skip(sk) {
    this.skipOption = sk;
    return this;
  }

  select(sel) {
    this.selectOptions = sel;
    return this;
  }

  populate(path, selectFields) {
    this.populateOptions.push({ path, selectFields });
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    return await executeQuery(this);
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

// Execute query for PostgresQueryBuilder
async function executeQuery(qb) {
  const { tableName, filter, sortOption, limitOption, skipOption, populateOptions, ModelClass } = qb;
  let sql = `SELECT * FROM ${tableName} WHERE 1=1`;
  const params = [];

  // Optimization: apply simple top-level SQL filters if present
  if (filter && typeof filter === 'object' && !filter.$or) {
    if (filter._id && typeof filter._id === 'string') {
      params.push(filter._id);
      sql += ` AND id = $${params.length}`;
    } else if (filter.id && typeof filter.id === 'string') {
      params.push(filter.id);
      sql += ` AND id = $${params.length}`;
    } else if (filter.email && typeof filter.email === 'string') {
      params.push(filter.email.toLowerCase());
      sql += ` AND (LOWER(email) = $${params.length} OR LOWER(data->>'email') = $${params.length})`;
    } else if (filter.user && typeof filter.user === 'string') {
      params.push(filter.user);
      sql += ` AND (user_id = $${params.length} OR data->>'user' = $${params.length})`;
    }
  }

  if (sortOption) {
    if (typeof sortOption === 'object') {
      const sortParts = Object.entries(sortOption).map(([col, dir]) => {
        const sqlCol = col === 'createdAt' || col === 'date' ? 'created_at' : `data->>'${col}'`;
        return `${sqlCol} ${dir === -1 || dir === 'desc' ? 'DESC' : 'ASC'}`;
      });
      if (sortParts.length) sql += ` ORDER BY ${sortParts.join(', ')}`;
    } else if (typeof sortOption === 'string') {
      const desc = sortOption.startsWith('-');
      const col = desc ? sortOption.slice(1) : sortOption;
      const sqlCol = col === 'createdAt' || col === 'date' ? 'created_at' : `data->>'${col}'`;
      sql += ` ORDER BY ${sqlCol} ${desc ? 'DESC' : 'ASC'}`;
    }
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  const res = await query(sql, params);
  let docs = res.rows.map(r => rowToDoc(r, tableName, ModelClass));

  // Apply JavaScript matcher for complete Mongo query compatibility ($or, $in, $ne, dot notation, etc.)
  if (filter && typeof filter === 'object') {
    docs = docs.filter(doc => matchesFilter(doc, filter));
  }

  // Handle offset and limit after filtering
  if (skipOption) {
    docs = docs.slice(skipOption);
  }
  if (limitOption) {
    docs = docs.slice(0, limitOption);
  }

  // Populate references if requested
  if (populateOptions && populateOptions.length && docs.length) {
    for (const pop of populateOptions) {
      const field = pop.path;
      for (const doc of docs) {
        if (doc[field]) {
          const refId = typeof doc[field] === 'object' ? doc[field]._id || doc[field].id : doc[field];
          if (typeof refId === 'string' && refId.length === 24) {
            const userRes = await query(`SELECT * FROM users WHERE id = $1`, [refId]);
            if (userRes.rows.length) {
              doc[field] = rowToDoc(userRes.rows[0], 'users');
            } else {
              const profRes = await query(`SELECT * FROM profiles WHERE id = $1`, [refId]);
              if (profRes.rows.length) {
                doc[field] = rowToDoc(profRes.rows[0], 'profiles');
              }
            }
          }
        }
      }
    }
  }

  return docs;
}

// Base Factory to create Mongoose-compatible Model Constructor Class
function createModelClass(tableName) {
  function Model(dataObj = {}) {
    Object.assign(this, dataObj);
    if (!this._id && !this.id) {
      this._id = generateObjectId();
      this.id = this._id;
    }
  }

  Model.prototype.save = async function () {
    const existing = await Model.findById(this._id);
    if (existing) {
      const updated = await updateDocument(tableName, this._id, this);
      Object.assign(this, updated);
      return this;
    }
    const created = await Model.create(this);
    Object.assign(this, created);
    return this;
  };

  Model.prototype.toObject = function () { return { ...this }; };
  Model.prototype.toJSON = function () { return { ...this }; };

  Model.create = async function (dataObj) {
    const id = dataObj._id || dataObj.id || generateObjectId();
    const now = new Date();
    const data = { ...dataObj, createdAt: now, updatedAt: now };

    const cols = ['id', 'data', 'created_at', 'updated_at'];
    const vals = [id, JSON.stringify(data)];
    const placeholders = ['$1', '$2', 'NOW()', 'NOW()'];

    const fieldToColumnMap = {
      email: 'email',
      password: 'password',
      role: 'role',
      user: 'user_id',
      name: 'name',
      title: 'title',
      url: 'url',
      drillType: 'drill_type',
      video: 'video_id',
      chat: 'chat_id',
      sender: 'sender_id',
      post: 'post_id',
      follower: 'follower_id',
      tournament: 'tournament_id',
      scout: 'scout_id',
      player: 'player_id',
      trial: 'trial_id',
      type: 'type',
      message: 'message'
    };

    for (const [field, col] of Object.entries(fieldToColumnMap)) {
      if (dataObj[field] !== undefined && dataObj[field] !== null) {
        const val = field === 'email' ? dataObj[field].toLowerCase() : dataObj[field];
        cols.push(col);
        vals.push(val);
        placeholders.push(`$${vals.length}`);
      }
    }

    const sql = `
      INSERT INTO ${tableName} (${cols.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *;
    `;

    try {
      const res = await query(sql, vals);
      return rowToDoc(res.rows[0], tableName, Model);
    } catch (err) {
      const fallbackSql = `
        INSERT INTO ${tableName} (id, data, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        RETURNING *;
      `;
      const res = await query(fallbackSql, [id, JSON.stringify(data)]);
      return rowToDoc(res.rows[0], tableName, Model);
    }
  };

  Model.find = function (filter = {}) {
    return new PostgresQueryBuilder(tableName, filter, Model);
  };

  Model.findOne = function (filter = {}) {
    const qb = new PostgresQueryBuilder(tableName, filter, Model);
    qb.limit(1);
    const originalExec = qb.exec.bind(qb);
    qb.exec = async () => {
      const docs = await originalExec();
      return docs[0] || null;
    };
    return qb;
  };

  Model.findById = async function (id) {
    if (!id) return null;
    return this.findOne({ _id: id });
  };

  Model.findByIdAndUpdate = async function (id, updateObj, options = {}) {
    if (!id) return null;
    const updates = updateObj.$set ? updateObj.$set : updateObj;
    try {
      return await updateDocument(tableName, id, updates);
    } catch (err) {
      return null;
    }
  };

  Model.findOneAndUpdate = async function (filter, updateObj, options = {}) {
    const doc = await this.findOne(filter);
    if (!doc) {
      if (options.upsert) {
        const cleanData = { ...filter, ...(updateObj.$set || updateObj) };
        return await this.create(cleanData);
      }
      return null;
    }
    return await this.findByIdAndUpdate(doc._id, updateObj, options);
  };

  Model.updateOne = async function (filter, updateObj) {
    const doc = await this.findOne(filter);
    if (doc) {
      await this.findByIdAndUpdate(doc._id, updateObj);
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  };

  Model.updateMany = async function (filter, updateObj) {
    const docs = await this.find(filter);
    for (const doc of docs) {
      await this.findByIdAndUpdate(doc._id, updateObj);
    }
    return { modifiedCount: docs.length };
  };

  Model.deleteOne = async function (filter) {
    const doc = await this.findOne(filter);
    if (doc) {
      await query(`DELETE FROM ${tableName} WHERE id = $1`, [doc._id]);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  };

  Model.findByIdAndDelete = async function (id) {
    if (!id) return null;
    const doc = await this.findById(id);
    if (doc) {
      await query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    }
    return doc;
  };

  Model.deleteMany = async function (filter) {
    const docs = await this.find(filter);
    for (const doc of docs) {
      await query(`DELETE FROM ${tableName} WHERE id = $1`, [doc._id]);
    }
    return { deletedCount: docs.length };
  };

  Model.countDocuments = async function (filter = {}) {
    const docs = await this.find(filter);
    return docs.length;
  };

  return Model;
}

// 15 PostgreSQL Active Record Models
const User = createModelClass('users');
const Profile = createModelClass('profiles');
const Video = createModelClass('videos');
const Analysis = createModelClass('analyses');
const Chat = createModelClass('chats');
const Message = createModelClass('messages');
const Post = createModelClass('posts');
const Comment = createModelClass('comments');
const Follower = createModelClass('followers');
const Notification = createModelClass('notifications');
const Tournament = createModelClass('tournaments');
const Application = createModelClass('applications');
const Trial = createModelClass('trials');
const ScoutRating = createModelClass('scout_ratings');
const ScoutReport = createModelClass('scout_reports');

module.exports = {
  User,
  Profile,
  Video,
  Analysis,
  Chat,
  Message,
  Post,
  Comment,
  Follower,
  Notification,
  Tournament,
  Application,
  Trial,
  ScoutRating,
  ScoutReport,
  generateObjectId
};
