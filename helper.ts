export const escapeCSVField = (field) => {
  if (field.includes('"') || field.includes(",") || field.includes("\n")) {
    // Nhân đôi dấu ngoặc kép bên trong trường
    field = field.replace(/"/g, '""');
    return `"${field}"`; // Bao bọc bằng dấu ngoặc kép
  }
  return field;
};

export const getLambdaNameFromJsonPath = (jsonPath: string): string => {
  // jsonPath: logs/display-log/prd-coupon-InvokeCouponDisplayLog-function.json
  // return: prd-coupon-InvokeCouponDisplayLog-function

  const split = jsonPath.split("/");
  return split[split.length - 1].split(".")[0];
};
