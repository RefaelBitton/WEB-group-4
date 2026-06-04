export function FeedbackMessage({ message }) {
  if (!message) {
    return null;
  }

  const isSuccess = message.startsWith("מעולה");

  return (
    <p
      className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
        isSuccess ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {message}
    </p>
  );
}
