export const escapeCSVField = (field) => {
  if (field.includes('"') || field.includes(",") || field.includes("\n")) {
    // Nhân đôi dấu ngoặc kép bên trong trường
    field = field.replace(/"/g, '""');
    return `"${field}"`; // Bao bọc bằng dấu ngoặc kép
  }
  return field;
};
