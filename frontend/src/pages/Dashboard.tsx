import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { authService } from "../services/authService";
import { questionService, type Question } from "../services/questionService";

export default function Dashboard() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await questionService.getAll();
      setQuestions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load questions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const logout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  const handleDelete = async (question: Question) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${question.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(question.id);
    setError("");

    try {
      await questionService.delete(question.id);
      setQuestions((previous) =>
        previous.filter((item) => item.id !== question.id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete the question.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const today = new Date().toLocaleDateString("en-CA");

  const dueCount = questions.filter(
    (question) => question.nextReviewDate <= today,
  ).length;

  const topicCount = new Set(
    questions.map((question) => question.topic.trim().toLowerCase()),
  ).size;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-indigo-600">
            DSA Recall
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {localStorage.getItem("dsa_username")}
            </span>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Your DSA Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Keep track of what you solve and what you need to revisit.
            </p>
          </div>

          <Link
            to="/questions/new"
            className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            + Add Question
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
            <button
              onClick={() => void loadQuestions()}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Questions solved" value={loading ? "..." : questions.length} />
          <StatCard label="Due for review" value={loading ? "..." : dueCount} />
          <StatCard label="Topics covered" value={loading ? "..." : topicCount} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Your questions</h2>

            <button
              onClick={() => void loadQuestions()}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-500">
              Loading your questions...
            </p>
          ) : questions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium">No questions added yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Start with a problem you have recently solved.
              </p>

              <Link
                to="/questions/new"
                className="mt-4 inline-block font-semibold text-indigo-600 hover:underline"
              >
                Add your first question
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Question</th>
                    <th className="px-3 py-3 font-medium">Topic</th>
                    <th className="px-3 py-3 font-medium">Difficulty</th>
                    <th className="px-3 py-3 font-medium">Next review</th>
                    <th className="px-3 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {questions.map((question) => (
                    <tr
                      key={question.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-3 py-4 font-semibold">
                        {question.title}
                      </td>

                      <td className="px-3 py-4">{question.topic}</td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 ${question.difficulty === "HARD"
                              ? "bg-red-100 text-red-700"
                              : question.difficulty === "MEDIUM"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}
                        >
                          {question.difficulty === "HARD"
                            ? "Hard"
                            : question.difficulty === "MEDIUM"
                              ? "Medium"
                              : "Easy"}
                        </span>
                      </td>


                      <td className="whitespace-nowrap px-3 py-4">{question.nextReviewDate ? new Date(question.nextReviewDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not scheduled"}</td>


                      <td className="px-3 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="View question"
                            aria-label={`View ${question.title}`}
                            onClick={() =>
                              navigate(`/questions/${question.id}/edit`)
                            }
                            className="rounded-lg p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            type="button"
                            title="Edit question"
                            aria-label={`Edit ${question.title}`}

                            onClick={() =>
                              navigate(`/questions/${question.id}`)
                            }
                            className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            title="Delete question"
                            aria-label={`Delete ${question.title}`}
                            disabled={deletingId === question.id}
                            onClick={() => void handleDelete(question)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
