const asyncHandler = (fn) => (req, res, next) => {
  // takes a function fn as an argument and returns a new function.
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
