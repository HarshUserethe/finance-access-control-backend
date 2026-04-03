exports.success = (res, data, statusCode = 200, meta = {}) => {
  const response = {
    status: 'success',
    ...meta,
    data,
  };
  return res.status(statusCode).json(response);
};

exports.created = (res, data, meta = {}) => {
  return exports.success(res, data, 201, meta);
};

exports.noContent = (res) => {
  return res.status(204).send();
};

exports.paginated = (res, data, page, limit, total) => {
  return res.status(200).json({
    status: 'success',
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    data,
  });
};
