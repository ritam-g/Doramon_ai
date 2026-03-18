const openings = [
    "Here is a practical way to approach it.",
    "A clean implementation would look like this.",
    "You can keep this simple while still making it feel polished.",
    "I would structure the next step like this.",
];

const closings = [
    "If you want, I can turn that into a concrete component next.",
    "I can also rewrite this into a tighter implementation if needed.",
    "If you need more detail, I can expand one of those pieces.",
    "I can turn that into a step-by-step checklist next.",
];

const topicRules = [
    {
        match: /(react|component|state|hook|dashboard|ui|tailwind)/i,
        bulletGroups: [
            [
                "Split the layout into a sidebar, message feed, and sticky composer.",
                "Keep transient UI state close to the page and move formatting into small helpers.",
                "Use a single accent color so primary actions stay obvious.",
            ],
            [
                "Prefer small components with one clear responsibility each.",
                "Let the conversation pane own scroll behavior and loading affordances.",
                "Handle empty states intentionally so a fresh chat still feels complete.",
            ],
        ],
        callToAction: [
            "A solid first pass is `Sidebar`, `ChatWindow`, `MessageBubble`, and `ChatInput`.",
            "Start with local state and only introduce shared state when backend wiring is real.",
        ],
    },
    {
        match: /(bug|error|debug|failing|issue|fix|broken|401|500)/i,
        bulletGroups: [
            [
                "Reproduce the issue in the smallest environment you can control.",
                "Log the exact input, response shape, and surrounding assumptions.",
                "Change one variable at a time so the signal stays clean.",
            ],
            [
                "Check environment config before you chase application code.",
                "Compare expected and actual payloads, not just status codes.",
                "Capture the failing request once so you stop guessing.",
            ],
        ],
        callToAction: [
            "If you share the failing code path, I can help isolate the likely fault line.",
            "The fastest next step is usually a targeted reproduction plus request logging.",
        ],
    },
    {
        match: /(write|copy|content|tweet|post|launch|marketing|plan)/i,
        bulletGroups: [
            [
                "Lead with the outcome before the feature list.",
                "Keep the language concrete so the value is obvious on first read.",
                "End with a narrow call to action instead of a generic close.",
            ],
            [
                "Pick one audience and one promise for the draft.",
                "Use short lines so the message stays easy to scan.",
                "Trim any phrase that sounds impressive but says little.",
            ],
        ],
        callToAction: [
            "If you want, I can draft three variants with different tone.",
            "I can turn that into launch copy, bullets, or a tighter outline.",
        ],
    },
];

const defaultBullets = [
    [
        "Clarify the goal and the one constraint that matters most.",
        "Choose the smallest workable shape before adding polish.",
        "Review the result against readability, speed, and failure cases.",
    ],
    [
        "Start with the user flow, then refine the implementation details.",
        "Make the first version easy to reason about before optimizing it.",
        "Preserve clean boundaries so follow-up changes stay cheap.",
    ],
];

const defaultCallsToAction = [
    "If you want more detail, I can turn that into a concrete example.",
    "I can also tailor that advice to your current code if you share the file.",
];

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

export function generateResponse(prompt) {
    const matchedRule = topicRules.find((rule) => rule.match.test(prompt));
    const bulletGroup = pickRandom(matchedRule?.bulletGroups ?? defaultBullets);
    const callToAction = pickRandom(matchedRule?.callToAction ?? defaultCallsToAction);

    return [
        pickRandom(openings),
        "",
        ...bulletGroup.map((bullet) => `- ${bullet}`),
        "",
        callToAction,
        pickRandom(closings),
    ].join("\n");
}

export default generateResponse;
