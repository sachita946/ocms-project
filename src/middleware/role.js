export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Check if user exists in request (comes from JWT auth middleware)
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found" });
      }

      const userRole = req.user.role;

      // Check if user's role is allowed for the route
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: "Forbidden: You do not have permission for this action" 
        });
      }

      next();
    } catch (err) {
      console.error("Role middleware error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
