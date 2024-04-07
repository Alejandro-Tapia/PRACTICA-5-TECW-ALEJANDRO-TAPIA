const Sequelize = require('sequelize');

const url = process.env.DATABASE_URL || "sqlite:blog.sqlite";

const sequelize = new Sequelize(url);

const Post = require('./post')(sequelize);
const Attachment = require('./attachment')(sequelize);

// Relation 1-to-1 between Post and Attachment
Attachment.hasOne(Post, {as: 'post', foreignKey: 'attachmentId'});
Post.belongsTo(Attachment, {as: 'attachment', foreignKey: 'attachmentId'});


module.exports = {
    sequelize,
    Post,
    Attachment
  };