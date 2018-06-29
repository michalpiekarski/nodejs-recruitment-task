module.exports = {
  $id: 'comment',
  type: 'object',
  properties: {
    id: { type: 'string' },
    comment: { type: 'string' },
  },
  required: ['id', 'comment'],
};
