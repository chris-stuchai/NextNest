import SwiftUI

/// A single milestone row with animated toggle and accessibility.
struct MilestoneRow: View {
    let milestone: Milestone
    let onToggle: () async -> Void

    @State private var isToggling = false

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.md) {
            Button {
                guard !isToggling else { return }
                isToggling = true
                Task {
                    await onToggle()
                    isToggling = false
                }
            } label: {
                Image(systemName: milestone.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(milestone.isCompleted ? Theme.accent : .secondary)
                    .scaleEffect(isToggling ? 1.3 : 1.0)
                    .animation(.spring(response: 0.3, dampingFraction: 0.5), value: isToggling)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(milestone.isCompleted ? "Completed: \(milestone.title)" : "Mark complete: \(milestone.title)")

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(milestone.title)
                    .font(.subheadline.weight(.medium))
                    .strikethrough(milestone.isCompleted, color: .secondary)
                    .foregroundStyle(milestone.isCompleted ? .secondary : .primary)

                if let description = milestone.description, !description.isEmpty {
                    Text(description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                HStack(spacing: Theme.Spacing.sm) {
                    Label(formattedDate, systemImage: "calendar")
                    Label(milestone.category.displayName, systemImage: milestone.category.iconName)
                }
                .font(.caption2)
                .foregroundStyle(.tertiary)
            }

            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.md)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
        .accessibilityElement(children: .combine)
    }

    private var formattedDate: String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let date = f.date(from: milestone.targetDate) else { return milestone.targetDate }
        f.dateFormat = "MMM d"
        return f.string(from: date)
    }
}
