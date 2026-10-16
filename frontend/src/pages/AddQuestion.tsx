import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { questionService, type QuestionInput } from "../services/questionService";

export default function AddQuestion() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    topic: "",
    difficulty: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
    problemUrl: "",
    dateSolved: new Date().toLocaleDateString("en-CA"),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload: QuestionInput = {
      title: form.title.trim(),
      topic: form.topic.trim(),
      difficulty: form.difficulty,
      problemUrl: form.problemUrl.trim() || null,
      approach: null,
      stuckPoint: null,
      pseudocode: null,
      codeLanguage: null,
      verificationStatus: "NOT_TESTED",
      finalCode: null,
      timeComplexity: null,
      spaceComplexity: null,
      notes: null,
    };

    try {
      const created = await questionService.create(payload);
      navigate(`/questions/${created.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save the question.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
            <BookOpen size={25} />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              STEP 1 OF 3
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Question Details
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Save the question now. You can add your thought process and code
              later.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Question title *
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Two Sum"
              required
              maxLength={250}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="topic"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Topic *
              </label>
              <input
                id="topic"
                name="topic"
                value={form.topic}
                onChange={handleChange}
                placeholder="e.g. Arrays"
                required
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="difficulty"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Difficulty *
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="problemUrl"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Problem URL
            </label>
            <input
              id="problemUrl"
              name="problemUrl"
              type="url"
              value={form.problemUrl}
              onChange={handleChange}
              placeholder="https://leetcode.com/problems/two-sum/"
              maxLength={1000}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="dateSolved"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Date solved
            </label>
            <input
              id="dateSolved"
              name="dateSolved"
              type="date"
              value={form.dateSolved}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              You can keep today’s date or change it to the date you attempted
              the problem.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Step 2: Thought Process · Step 3: Code & Verification
        </p>
      </div>
    </div>
  );
}
