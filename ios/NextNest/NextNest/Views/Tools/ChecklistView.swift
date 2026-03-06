import SwiftUI

/// AI-generated pre-move checklist with persistence — once generated, stays until user regenerates.
struct ChecklistView: View {
    @EnvironmentObject private var haptics: HapticManager
    @State private var items: [ChecklistItem] = []
    @State private var completedIds: Set<String> = []
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        Group {
            if isLoading {
                loadingState
            } else if items.isEmpty {
                emptyState
            } else {
                checklistContent
            }
        }
        .navigationTitle("Pre-Move Checklist")
        .onAppear { loadSaved() }
    }

    private var loadingState: some View {
        VStack(spacing: Theme.Spacing.md) {
            ProgressView()
            Text("AI is building your checklist...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var checklistContent: some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.sm) {
                progressHeader
                ForEach(items) { item in
                    ChecklistRow(
                        item: item,
                        isCompleted: completedIds.contains(item.id),
                        onToggle: {
                            haptics.select()
                            if completedIds.contains(item.id) {
                                completedIds.remove(item.id)
                            } else {
                                completedIds.insert(item.id)
                                haptics.success()
                            }
                            LocalStorage.saveChecklistCompleted(completedIds)
                        }
                    )
                }
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button {
                        haptics.impact()
                        Task { await generateChecklist() }
                    } label: {
                        Label("Regenerate Checklist", systemImage: "arrow.clockwise")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle").font(.body)
                }
            }
        }
    }

    private var progressHeader: some View {
        VStack(spacing: Theme.Spacing.sm) {
            Text("\(completedIds.count) of \(items.count) completed")
                .font(.subheadline.weight(.medium))
            ProgressView(value: Double(completedIds.count), total: Double(max(items.count, 1)))
                .tint(Theme.accent)
        }
        .cardStyle()
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "checklist")
                .font(.system(size: 48))
                .foregroundStyle(Theme.accent)
            Text("AI Pre-Move Checklist")
                .font(.title3.weight(.bold))
            Text("Generate a personalized checklist based on your move details. It stays saved until you regenerate.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            if let error {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
            }
            Button {
                haptics.impact()
                Task { await generateChecklist() }
            } label: {
                Label("Generate Checklist", systemImage: "sparkles")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(Theme.accent)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
            }
        }
        .padding(Theme.Spacing.xxl)
    }

    private func loadSaved() {
        if let saved = LocalStorage.loadChecklist() {
            items = saved
            completedIds = LocalStorage.loadChecklistCompleted()
        }
    }

    private func generateChecklist() async {
        isLoading = true
        error = nil
        do {
            let generated = try await APIClient.shared.generateChecklist()
            items = generated
            completedIds = LocalStorage.loadChecklistCompleted().filter { id in
                generated.contains { $0.id == id }
            }
            LocalStorage.saveChecklist(generated)
            LocalStorage.saveChecklistCompleted(completedIds)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }
}

struct ChecklistRow: View {
    let item: ChecklistItem
    let isCompleted: Bool
    let onToggle: () -> Void

    var priorityColor: Color {
        switch item.priority {
        case "high": return .red
        case "medium": return .orange
        default: return .green
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.md) {
            Button(action: onToggle) {
                Image(systemName: isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(isCompleted ? Theme.accent : .secondary)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(item.task)
                    .font(.subheadline.weight(.medium))
                    .strikethrough(isCompleted)
                    .foregroundStyle(isCompleted ? .secondary : .primary)

                HStack(spacing: Theme.Spacing.sm) {
                    Label(item.timeframe, systemImage: "clock")
                    Text("•")
                    Text(item.priority.capitalized)
                        .foregroundStyle(priorityColor)
                }
                .font(.caption2)
                .foregroundStyle(.tertiary)

                Text(item.tip)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer(minLength: 0)
        }
        .padding(Theme.Spacing.md)
        .background(Theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius, style: .continuous))
    }
}
