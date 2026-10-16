import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import {
  questionService,
  type Question,
  type QuestionInput,
} from "../services/questionService";

type FormState = QuestionInput;

const emptyForm: FormState = {
  title: "",
  topic: "",
  difficulty: "MEDIUM",
  problemUrl: "",
  approach: "",
  stuckPoint: "",
  pseudocode: "",
  codeLanguage: "",
  verificationStatus: "NOT_TESTED",
  finalCode: "",
  timeComplexity: "",
  spaceComplexity: "",
  notes: "",
};

function toForm(question: Question): FormState {
  return {
    title: question.title ?? "",
    topic: question.topic ?? "",
    difficulty: question.difficulty,
    problemUrl: question.problemUrl ?? "",
    approach: question.approach ?? "",
    stuckPoint: question.stuckPoint ?? "",
    pseudocode: question.pseudocode ?? "",
    codeLanguage: question.codeLanguage ?? "",
    verificationStatus: question.verificationStatus ?? "NOT_TESTED",
    finalCode: question.finalCode ?? "",
    timeComplexity: question.timeComplexity ?? "",
    spaceComplexity: question.spaceComplexity ?? "",
    notes: question.notes ?? "",
  };
}

function optionalValue(value: string | null | undefined) {
  return value?.trim() || null;
}

export default function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        setError("Invalid question ID.");
        setLoading(false);
        return;
      }

      try {
        const result = await questionService.getById(Number(id));

        if (!cancelled) {
          setQuestion(result);
          setForm(toForm(result));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load the question.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!question) return;

    setSaving(true);
    setError("");

    const payload: QuestionInput = {
      title: form.title.trim(),
      topic: form.topic.trim(),
      difficulty: form.difficulty,
      problemUrl: optionalValue(form.problemUrl),
      approach: optionalValue(form.approach),
      stuckPoint: optionalValue(form.stuckPoint),
      pseudocode: optionalValue(form.pseudocode),
      codeLanguage: optionalValue(form.codeLanguage),
      verificationStatus: form.verificationStatus,
      finalCode: optionalValue(form.finalCode),
      timeComplexity: optionalValue(form.timeComplexity),
      spaceComplexity: optionalValue(form.spaceComplexity),
      notes: optionalValue(form.notes),
    };

    try {
      await questionService.update(question.id, payload);
      navigate('dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update the question.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading question...</p>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
          <p className="text-red-700">{error || "Question not found."}</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-block font-medium text-indigo-600 hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to={`/dashboard`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to question
        </Link>

        <div className="mb-6">
          <p className="text-sm font-semibold text-indigo-600">EDIT QUESTION</p>
          <h1 className="mt-1 text-3xl font-bold">{question.title}</h1>
          <p className="mt-2 text-slate-600">
            Your existing notes and code are prefilled. Change only what you
            need and save your updates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Step 1 — Question details</h2>

            <Field label="Question title *">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={250}
                className={inputClass}
                placeholder="e.g. Two Sum"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Topic *">
                <input
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className={inputClass}
                  placeholder="e.g. Arrays"
                />
              </Field>

              <Field label="Difficulty *">
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </Field>
            </div>

            <Field label="Problem URL">
              <input
                name="problemUrl"
                type="url"
                value={form.problemUrl ?? ""}
                onChange={handleChange}
                maxLength={1000}
                className={inputClass}
                placeholder="https://..."
              />
            </Field>
          </section>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Step 2 — Thought process</h2>

            <Field label="Approach">
              <textarea
                name="approach"
                value={form.approach ?? ""}
                onChange={handleChange}
                rows={4}
                className={inputClass}
                placeholder="How did you approach the problem?"
              />
            </Field>

            <Field label="Where did you get stuck?">
              <textarea
                name="stuckPoint"
                value={form.stuckPoint ?? ""}
                onChange={handleChange}
                rows={3}
                className={inputClass}
                placeholder="What was difficult or confusing?"
              />
            </Field>

            <Field label="Pseudocode">
              <textarea
                name="pseudocode"
                value={form.pseudocode ?? ""}
                onChange={handleChange}
                rows={5}
                className={`${inputClass} font-mono text-sm`}
                placeholder="Write the steps of your solution..."
              />
            </Field>
          </section>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Step 3 — Code and verification</h2>

            <Field label="Programming language">
              <input
                name="codeLanguage"
                value={form.codeLanguage ?? ""}
                onChange={handleChange}
                maxLength={50}
                className={inputClass}
                placeholder="e.g. Java"
              />
            </Field>

            <Field label="Final code">
              <textarea
                name="finalCode"
                value={form.finalCode ?? ""}
                onChange={handleChange}
                rows={12}
                className={`${inputClass} font-mono text-sm`}
                placeholder="Paste your final solution..."
              />
            </Field>

            <Field label="Verification status">
              <select
                name="verificationStatus"
                value={form.verificationStatus}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="NOT_TESTED">Not tested</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="PARTIAL">Partially passed</option>
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Time complexity">
                <input
                  name="timeComplexity"
                  value={form.timeComplexity ?? ""}
                  onChange={handleChange}
                  maxLength={100}
                  className={inputClass}
                  placeholder="e.g. O(n)"
                />
              </Field>

              <Field label="Space complexity">
                <input
                  name="spaceComplexity"
                  value={form.spaceComplexity ?? ""}
                  onChange={handleChange}
                  maxLength={100}
                  className={inputClass}
                  placeholder="e.g. O(n)"
                />
              </Field>
            </div>

            <Field label="Additional notes">
              <textarea
                name="notes"
                value={form.notes ?? ""}
                onChange={handleChange}
                rows={4}
                className={inputClass}
                placeholder="Anything else to remember..."
              />
            </Field>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('dashboard')}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium hover:bg-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
