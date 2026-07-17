
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;

  if (!data) return fallback;

  if (data.message) return data.message;

  if (data.errors) {
    const firstField = Object.keys(data.errors)[0];
    if (firstField) return `${firstField}: ${data.errors[firstField]}`;
  }

  return fallback;
}
