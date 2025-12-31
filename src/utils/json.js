// Send success response
export function success(res, data, message = "Success") {
  return res.json({ success: true, message, data });
}

// Send error response
export function error(res, message = "Error", code = 400) {
  return res.status(code).json({ success: false, message });
}
