import SwiftUI

/// Native conversational intake flow — 10 questions, one at a time.
struct IntakeFlowView: View {
    let onComplete: () async -> Void

    @EnvironmentObject private var haptics: HapticManager
    @State private var step = 0
    @State private var isSubmitting = false
    @State private var isGenerating = false
    @State private var error: String?

    @State private var movingFrom = ""
    @State private var movingTo = ""
    @State private var targetMoveDate = Date().addingTimeInterval(90 * 86400)
    @State private var moveType: MoveType = .rent
    @State private var needsToSell = false
    @State private var hasPreApproval = false
    @State private var employmentSecured = false
    @State private var timelineFlexibility: TimelineFlexibility = .somewhat
    @State private var peopleCount = 1
    @State private var topConcern = ""

    private let totalSteps = 10

    var body: some View {
        VStack(spacing: 0) {
            progressBar
            ScrollView {
                VStack(spacing: Theme.Spacing.xl) {
                    stepContent
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal: .move(edge: .leading).combined(with: .opacity)
                        ))
                        .id(step)
                }
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.top, Theme.Spacing.xl)
            }

            navigationButtons
        }
        .background(Theme.background)
        .navigationTitle("Plan Your Move")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var progressBar: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Theme.accentLight)
                Capsule()
                    .fill(Theme.accent)
                    .frame(width: geo.size.width * CGFloat(step + 1) / CGFloat(totalSteps))
                    .animation(.spring(response: 0.4), value: step)
            }
        }
        .frame(height: 4)
    }

    @ViewBuilder
    private var stepContent: some View {
        switch step {
        case 0:
            QuestionView(
                title: "Where are you moving from?",
                subtitle: "Enter your current city"
            ) {
                InputField(icon: "mappin.circle.fill", placeholder: "e.g. San Francisco, CA", text: $movingFrom)
                    .textContentType(.addressCity)
            }
        case 1:
            QuestionView(
                title: "Where are you moving to?",
                subtitle: "Enter your destination city"
            ) {
                InputField(icon: "mappin.and.ellipse", placeholder: "e.g. Austin, TX", text: $movingTo)
                    .textContentType(.addressCity)
            }
        case 2:
            QuestionView(
                title: "When do you want to move?",
                subtitle: "Pick your target move date"
            ) {
                DatePicker("Move date", selection: $targetMoveDate, in: Date()..., displayedComponents: .date)
                    .datePickerStyle(.graphical)
                    .tint(Theme.accent)
            }
        case 3:
            QuestionView(
                title: "Are you buying or renting?",
                subtitle: "This helps us tailor your timeline"
            ) {
                ChoicePicker(options: MoveType.allCases, selection: $moveType) { $0.displayName }
            }
        case 4:
            QuestionView(
                title: "Do you need to sell your current home?",
                subtitle: "We'll add selling milestones if so"
            ) {
                ChoicePicker(options: [true, false], selection: $needsToSell) { $0 ? "Yes" : "No" }
            }
        case 5:
            QuestionView(
                title: "Do you have mortgage pre-approval?",
                subtitle: moveType == .buy ? "Important for your buying timeline" : "Skip if renting"
            ) {
                ChoicePicker(options: [true, false], selection: $hasPreApproval) { $0 ? "Yes" : "Not yet" }
            }
        case 6:
            QuestionView(
                title: "Is your employment secured?",
                subtitle: "Job at the destination, remote work, etc."
            ) {
                ChoicePicker(options: [true, false], selection: $employmentSecured) { $0 ? "Yes" : "Not yet" }
            }
        case 7:
            QuestionView(
                title: "How flexible is your timeline?",
                subtitle: "This affects how we schedule milestones"
            ) {
                ChoicePicker(options: TimelineFlexibility.allCases, selection: $timelineFlexibility) { $0.displayName }
            }
        case 8:
            QuestionView(
                title: "How many people are moving?",
                subtitle: "Including yourself"
            ) {
                Stepper(value: $peopleCount, in: 1...20) {
                    HStack {
                        Image(systemName: "person.2.fill")
                            .foregroundStyle(Theme.accent)
                        Text("\(peopleCount) \(peopleCount == 1 ? "person" : "people")")
                            .font(.title3.weight(.semibold))
                    }
                }
                .padding(Theme.Spacing.md)
                .background(Theme.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
            }
        case 9:
            QuestionView(
                title: "What's your biggest concern?",
                subtitle: "Optional — helps us prioritize your plan"
            ) {
                TextField("e.g. Finding affordable housing...", text: $topConcern, axis: .vertical)
                    .lineLimit(3...6)
                    .padding(Theme.Spacing.md)
                    .background(Theme.secondaryBackground)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
            }
        default:
            EmptyView()
        }

        if let error {
            Text(error)
                .font(.caption)
                .foregroundStyle(.red)
        }
    }

    private var navigationButtons: some View {
        HStack(spacing: Theme.Spacing.md) {
            if step > 0 {
                Button {
                    haptics.tap()
                    withAnimation { step -= 1 }
                } label: {
                    Label("Back", systemImage: "chevron.left")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Theme.secondaryBackground)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
                }
            }

            Button {
                haptics.impact()
                if step < totalSteps - 1 {
                    withAnimation(.spring(response: 0.4)) { step += 1 }
                } else {
                    Task { await submitIntake() }
                }
            } label: {
                Group {
                    if isSubmitting || isGenerating {
                        HStack(spacing: Theme.Spacing.sm) {
                            ProgressView().tint(.white)
                            Text(isGenerating ? "Building plan..." : "Submitting...")
                                .font(.headline)
                        }
                    } else {
                        Text(step < totalSteps - 1 ? "Continue" : "Create My Plan")
                            .font(.headline)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(canContinue ? Theme.accent : Theme.accent.opacity(0.4))
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
            }
            .disabled(!canContinue || isSubmitting || isGenerating)
        }
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.vertical, Theme.Spacing.md)
        .background(.ultraThinMaterial)
    }

    private var canContinue: Bool {
        switch step {
        case 0: return movingFrom.count >= 2
        case 1: return movingTo.count >= 2
        default: return true
        }
    }

    private func submitIntake() async {
        isSubmitting = true
        error = nil
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        let request = IntakeRequest(
            movingFrom: movingFrom,
            movingTo: movingTo,
            targetMoveDate: formatter.string(from: targetMoveDate),
            moveType: moveType.rawValue,
            needsToSell: needsToSell,
            hasPreApproval: hasPreApproval,
            employmentSecured: employmentSecured,
            timelineFlexibility: timelineFlexibility.rawValue,
            peopleCount: peopleCount,
            topConcern: topConcern
        )

        do {
            let result = try await APIClient.shared.submitIntake(request)
            isSubmitting = false
            isGenerating = true
            _ = try await APIClient.shared.generatePlan(planId: result.planId)
            isGenerating = false
            haptics.success()
            await onComplete()
        } catch {
            isSubmitting = false
            isGenerating = false
            self.error = error.localizedDescription
            haptics.error()
        }
    }
}

// MARK: - Supporting Views

struct QuestionView<Content: View>: View {
    let title: String
    let subtitle: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(title)
                    .font(.title2.weight(.bold))
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            content()
        }
    }
}

/// A horizontal picker for a small set of options.
struct ChoicePicker<T: Hashable>: View {
    let options: [T]
    @Binding var selection: T
    let label: (T) -> String

    var body: some View {
        HStack(spacing: Theme.Spacing.sm) {
            ForEach(options, id: \.self) { option in
                Button {
                    withAnimation(.spring(response: 0.3)) { selection = option }
                } label: {
                    Text(label(option))
                        .font(.subheadline.weight(.medium))
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(selection == option ? Theme.accent : Theme.secondaryBackground)
                        .foregroundStyle(selection == option ? .white : .primary)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.smallCornerRadius, style: .continuous))
                }
            }
        }
    }
}
