
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Code2,
    FileText,
    LoaderCircle,
    NotebookPen,
    Pencil,
    Save,
    Trash2,
    X,
} from "lucide-react";

import {
    questionService,
    type Question,
    type QuestionDetailsInput,
    type QuestionNotesInput,
    type QuestionCodeInput,
} from "../services/questionService";

type EditSection = "details" | "notes" | "code" | null;

const emptyDetails: QuestionDetailsInput = {
    title: "",
    topic: "",
    difficulty: "MEDIUM",
    problemUrl: "",
    dateSolved: "",
};

const emptyNotes: QuestionNotesInput = {
    approach: "",
    stuckPoint: "",
    pseudocode: "",
    notes: "",
};

const emptyCode: QuestionCodeInput = {
    codeLanguage: "",
    verificationStatus: "NOT_TESTED",
    finalCode: "",
    timeComplexity: "",
    spaceComplexity: "",
};

function textValue(value: string | null | undefined) {
    return value ?? "";
}

function nullableValue(value: string | null | undefined): string | null {
    return value?.trim() || null;
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    multiline = false,
    required = false,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    multiline?: boolean;
    required?: boolean;
    type?: string;
}) {
    const className =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

    return (
        <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">{label}</span>

            {multiline ? (
                <textarea
                    className={`${className} min-h-28 resize-y`}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    required={required}
                    rows={4}
                />
            ) : (
                <input
                    className={className}
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    required={required}
                />
            )}
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function DisplayField({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="min-w-0">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
            </p>
            <p className="whitespace-pre-wrap break-words text-sm text-slate-800">
                {value?.trim() || "Not added yet"}
            </p>
        </div>
    );
}

function SectionHeader({
    icon,
    title,
    description,
    onEdit,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    onEdit: () => void;
}) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    {icon}
                </div>
                <div>
                    <h2 className="font-semibold text-slate-900">{title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
            </div>

            <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                <Pencil size={15} />
                Edit {title.toLowerCase()}
            </button>
        </div>
    );
}

export default function QuestionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [activeSection, setActiveSection] = useState<EditSection>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [details, setDetails] =
        useState<QuestionDetailsInput>(emptyDetails);
    const [notes, setNotes] = useState<QuestionNotesInput>(emptyNotes);
    const [code, setCode] = useState<QuestionCodeInput>(emptyCode);

    const questionId = Number(id);

    async function loadQuestion() {
        if (!Number.isInteger(questionId) || questionId <= 0) {
            setError("Invalid question ID.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const result = await questionService.getById(questionId);
            setQuestion(result);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to load question.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadQuestion();
        // Load the question when its URL ID changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionId]);

    function openEditor(section: Exclude<EditSection, null>) {
        if (!question) return;

        setError("");
        setSuccess("");
        setActiveSection(section);

        if (section === "details") {
            setDetails({
                title: question.title,
                topic: question.topic,
                difficulty: question.difficulty,
                problemUrl: textValue(question.problemUrl),
                dateSolved: question.dateSolved,
            });
        }

        if (section === "notes") {
            setNotes({
                approach: textValue(question.approach),
                stuckPoint: textValue(question.stuckPoint),
                pseudocode: textValue(question.pseudocode),
                notes: textValue(question.notes),
            });
        }

        if (section === "code") {
            setCode({
                codeLanguage: textValue(question.codeLanguage),
                verificationStatus: question.verificationStatus,
                finalCode: textValue(question.finalCode),
                timeComplexity: textValue(question.timeComplexity),
                spaceComplexity: textValue(question.spaceComplexity),
            });
        }
    }

    function closeEditor() {
        setActiveSection(null);
        setError("");
    }

    async function saveDetails(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!question) return;

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const updated = await questionService.updateDetails(question.id, {
                ...details,
                title: details.title.trim(),
                topic: details.topic.trim(),
                problemUrl: nullableValue(details.problemUrl),
            });

            setQuestion(updated);
            setActiveSection(null);
            setSuccess("Question details saved successfully.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to save details.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function saveNotes(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!question) return;

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const updated = await questionService.updateNotes(question.id, {
                approach: nullableValue(notes.approach),
                stuckPoint: nullableValue(notes.stuckPoint),
                pseudocode: nullableValue(notes.pseudocode),
                notes: nullableValue(notes.notes),
            });

            setQuestion(updated);
            setActiveSection(null);
            setSuccess("Notes saved successfully.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to save notes.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function saveCode(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!question) return;

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const updated = await questionService.updateCode(question.id, {
                codeLanguage: nullableValue(code.codeLanguage),
                verificationStatus: code.verificationStatus,
                finalCode: nullableValue(code.finalCode),
                timeComplexity: nullableValue(code.timeComplexity),
                spaceComplexity: nullableValue(code.spaceComplexity),
            });

            setQuestion(updated);
            setActiveSection(null);
            setSuccess("Code section saved successfully.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to save code.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!question) return;

        const confirmed = window.confirm(
            `Delete "${question.title}"? This action cannot be undone.`,
        );

        if (!confirmed) return;

        try {
            setDeleting(true);
            setError("");
            await questionService.delete(question.id);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to delete question.",
            );
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center gap-2 text-slate-600">
                <LoaderCircle className="animate-spin" size={20} />
                Loading question...
            </div>
        );
    }

    if (!question) {
        return (
            <main className="mx-auto max-w-3xl p-6">
                <p className="mb-4 text-red-600">
                    {error || "Question not found."}
                </p>
                <Link
                    to="/dashboard"
                    className="text-sm font-medium text-indigo-600 hover:underline"
                >
                    Back to dashboard
                </Link>
            </main>
        );
    }

    const statusLabel = question.verificationStatus
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const buttonClass =
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60";

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
                    >
                        <ArrowLeft size={17} />
                        Back to dashboard
                    </Link>

                    <button
                        type="button"
                        onClick={() => void handleDelete()}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                        <Trash2 size={15} />
                        {deleting ? "Deleting..." : "Delete question"}
                    </button>
                </div>

                <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="mb-2 text-sm font-medium text-indigo-600">
                                {question.topic}
                            </p>
                            <h1 className="break-words text-2xl font-bold text-slate-900">
                                {question.title}
                            </h1>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                    {question.difficulty}
                                </span>
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                    {statusLabel}
                                </span>
                            </div>
                        </div>

                        {question.problemUrl && (
                            <a
                                href={question.problemUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-medium text-indigo-600 hover:underline"
                            >
                                Open problem ↗
                            </a>
                        )}
                    </div>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                    >
                        <span className="inline-flex items-center gap-2">
                            <CheckCircle2 size={17} />
                            {success}
                        </span>
                    </div>
                )}

                {/* STEP 1: QUESTION DETAILS */}
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <SectionHeader
                        icon={<FileText size={20} />}
                        title="Details"
                        description="Basic information about the problem."
                        onEdit={() => openEditor("details")}
                    />

                    {activeSection === "details" ? (
                        <form onSubmit={saveDetails} className="space-y-4 border-t border-slate-100 pt-5">
                            <Field
                                label="Question title"
                                value={details.title}
                                onChange={(value) =>
                                    setDetails((previous) => ({ ...previous, title: value }))
                                }
                                required
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Topic"
                                    value={details.topic}
                                    onChange={(value) =>
                                        setDetails((previous) => ({ ...previous, topic: value }))
                                    }
                                    required
                                />

                                <SelectField
                                    label="Difficulty"
                                    value={details.difficulty}
                                    onChange={(value) =>
                                        setDetails((previous) => ({
                                            ...previous,
                                            difficulty: value as QuestionDetailsInput["difficulty"],
                                        }))
                                    }
                                    options={[
                                        { value: "EASY", label: "Easy" },
                                        { value: "MEDIUM", label: "Medium" },
                                        { value: "HARD", label: "Hard" },
                                    ]}
                                />
                            </div>

                            <Field
                                label="Problem URL"
                                value={textValue(details.problemUrl)}
                                onChange={(value) =>
                                    setDetails((previous) => ({
                                        ...previous,
                                        problemUrl: value,
                                    }))
                                }
                                placeholder="https://..."
                                type="url"
                            />

                            <Field
                                label="Date solved"
                                value={details.dateSolved}
                                onChange={(value) =>
                                    setDetails((previous) => ({
                                        ...previous,
                                        dateSolved: value,
                                    }))
                                }
                                type="date"
                            />

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
                                >
                                    <Save size={16} />
                                    {saving ? "Saving..." : "Save details"}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEditor}
                                    disabled={saving}
                                    className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-50`}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
                            <DisplayField label="Title" value={question.title} />
                            <DisplayField label="Topic" value={question.topic} />
                            <DisplayField label="Difficulty" value={question.difficulty} />
                            <DisplayField
                                label="Problem URL"
                                value={question.problemUrl}
                            />
                            <div className="flex items-start gap-2 text-sm text-slate-700">
                                <CalendarDays size={17} className="mt-0.5 text-slate-400" />
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Date solved
                                    </p>

                                    <p className="mt-1">{question.dateSolved ? new Date(question.dateSolved).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set"}</p>

                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* STEP 2: NOTES AND THOUGHT PROCESS */}
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <SectionHeader
                        icon={<NotebookPen size={20} />}
                        title="Notes"
                        description="Your approach, difficulties, and pseudocode."
                        onEdit={() => openEditor("notes")}
                    />

                    {activeSection === "notes" ? (
                        <form onSubmit={saveNotes} className="space-y-4 border-t border-slate-100 pt-5">
                            <Field
                                label="Approach"
                                value={textValue(notes.approach)}
                                onChange={(value) =>
                                    setNotes((previous) => ({ ...previous, approach: value }))
                                }
                                multiline
                                placeholder="Explain how you approached the problem..."
                            />

                            <Field
                                label="Where did you get stuck?"
                                value={textValue(notes.stuckPoint)}
                                onChange={(value) =>
                                    setNotes((previous) => ({ ...previous, stuckPoint: value }))
                                }
                                multiline
                                placeholder="What was confusing or difficult?"
                            />

                            <Field
                                label="Pseudocode"
                                value={textValue(notes.pseudocode)}
                                onChange={(value) =>
                                    setNotes((previous) => ({ ...previous, pseudocode: value }))
                                }
                                multiline
                                placeholder="Write the solution steps..."
                            />

                            <Field
                                label="Additional notes"
                                value={textValue(notes.notes)}
                                onChange={(value) =>
                                    setNotes((previous) => ({ ...previous, notes: value }))
                                }
                                multiline
                                placeholder="Any extra observations or reminders..."
                            />

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
                                >
                                    <Save size={16} />
                                    {saving ? "Saving..." : "Save notes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEditor}
                                    disabled={saving}
                                    className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-50`}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-5 border-t border-slate-100 pt-5">
                            <DisplayField label="Approach" value={question.approach} />
                            <DisplayField label="Where you got stuck" value={question.stuckPoint} />
                            <DisplayField label="Pseudocode" value={question.pseudocode} />
                            <DisplayField label="Additional notes" value={question.notes} />
                        </div>
                    )}
                </section>

                {/* STEP 3: CODE AND VERIFICATION */}
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <SectionHeader
                        icon={<Code2 size={20} />}
                        title="Code"
                        description="Your solution, verification, and complexity."
                        onEdit={() => openEditor("code")}
                    />

                    {activeSection === "code" ? (
                        <form onSubmit={saveCode} className="space-y-4 border-t border-slate-100 pt-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Programming language"
                                    value={textValue(code.codeLanguage)}
                                    onChange={(value) =>
                                        setCode((previous) => ({
                                            ...previous,
                                            codeLanguage: value,
                                        }))
                                    }
                                    placeholder="Java, Python, C++..."
                                />

                                <SelectField
                                    label="Verification status"
                                    value={code.verificationStatus}
                                    onChange={(value) =>
                                        setCode((previous) => ({
                                            ...previous,
                                            verificationStatus:
                                                value as QuestionCodeInput["verificationStatus"],
                                        }))
                                    }
                                    options={[
                                        { value: "NOT_TESTED", label: "Not tested" },
                                        { value: "PASSED", label: "Passed" },
                                        { value: "FAILED", label: "Failed" },
                                        { value: "PARTIAL", label: "Partially passed" },
                                    ]}
                                />
                            </div>

                            <Field
                                label="Final code"
                                value={textValue(code.finalCode)}
                                onChange={(value) =>
                                    setCode((previous) => ({ ...previous, finalCode: value }))
                                }
                                multiline
                                placeholder="Paste your final solution..."
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Time complexity"
                                    value={textValue(code.timeComplexity)}
                                    onChange={(value) =>
                                        setCode((previous) => ({
                                            ...previous,
                                            timeComplexity: value,
                                        }))
                                    }
                                    placeholder="O(n)"
                                />

                                <Field
                                    label="Space complexity"
                                    value={textValue(code.spaceComplexity)}
                                    onChange={(value) =>
                                        setCode((previous) => ({
                                            ...previous,
                                            spaceComplexity: value,
                                        }))
                                    }
                                    placeholder="O(1)"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
                                >
                                    <Save size={16} />
                                    {saving ? "Saving..." : "Save code"}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEditor}
                                    disabled={saving}
                                    className={`${buttonClass} border border-slate-300 text-slate-700 hover:bg-slate-50`}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-5 border-t border-slate-100 pt-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <DisplayField
                                    label="Programming language"
                                    value={question.codeLanguage}
                                />
                                <DisplayField
                                    label="Verification status"
                                    value={statusLabel}
                                />
                                <DisplayField
                                    label="Time complexity"
                                    value={question.timeComplexity}
                                />
                                <DisplayField
                                    label="Space complexity"
                                    value={question.spaceComplexity}
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Final code
                                </p>
                                {question.finalCode ? (
                                    <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-relaxed text-slate-100">
                                        <code>{question.finalCode}</code>
                                    </pre>
                                ) : (
                                    <p className="text-sm text-slate-500">No code added yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <footer className="flex flex-wrap gap-5 border-t border-slate-200 pt-4 text-sm text-slate-500">
                    <span>Next review:{" "}
                        {question.nextReviewDate
                            ? new Date(question.nextReviewDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })
                            : "Not scheduled"}
                    </span>
                    <span>Review count: {question.reviewCount}</span>
                    <span>Interval: {question.intervalDays} days</span>
                </footer>
            </div>
        </main>
    );
}
