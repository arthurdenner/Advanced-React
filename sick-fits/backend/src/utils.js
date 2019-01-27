function hasPermission(user, permissionsNeeded) {
  const hasPermissionsNeeded = user.permissions.some(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );

  if (!hasPermissionsNeeded) {
    throw new Error("You don't have permission to do that");
  }
}

exports.hasPermission = hasPermission;
