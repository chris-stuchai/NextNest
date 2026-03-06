import SwiftUI

/// Timeline screen showing all milestones grouped by category.
struct TimelineView: View {
    @ObservedObject var viewModel: DashboardViewModel
    @EnvironmentObject private var haptics: HapticManager
    @State private var selectedFilter: MilestoneCategory?

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.dashboardData == nil {
                    ProgressView()
                } else if viewModel.milestones.isEmpty {
                    emptyState
                } else {
                    timelineContent
                }
            }
            .navigationTitle("Timeline")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private var timelineContent: some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.md) {
                summaryHeader
                filterChips
                milestonesSection
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .refreshable {
            haptics.tap()
            await viewModel.loadDashboard()
        }
    }

    private var summaryHeader: some View {
        HStack(spacing: Theme.Spacing.md) {
            StatCard(value: "\(viewModel.completedMilestones)", label: "Done", icon: "checkmark.circle.fill", color: .green)
            StatCard(value: "\(viewModel.totalMilestones - viewModel.completedMilestones)", label: "Remaining", icon: "circle", color: .orange)
            StatCard(value: "\(viewModel.readinessScore)%", label: "Ready", icon: "gauge.medium", color: Theme.accent)
        }
    }

    private var filterChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.sm) {
                FilterChip(title: "All", isSelected: selectedFilter == nil) {
                    haptics.select()
                    withAnimation { selectedFilter = nil }
                }
                ForEach(MilestoneCategory.allCases, id: \.self) { cat in
                    FilterChip(title: cat.displayName, isSelected: selectedFilter == cat) {
                        haptics.select()
                        withAnimation { selectedFilter = selectedFilter == cat ? nil : cat }
                    }
                }
            }
            .padding(.horizontal, Theme.Spacing.xs)
        }
    }

    private var milestonesSection: some View {
        ForEach(filteredCategories, id: \.0) { category, milestones in
            Section {
                ForEach(milestones) { milestone in
                    MilestoneRow(milestone: milestone) {
                        haptics.success()
                        await viewModel.toggleMilestone(milestone)
                    }
                }
            } header: {
                HStack(spacing: Theme.Spacing.sm) {
                    Image(systemName: category.iconName)
                        .foregroundStyle(categoryColor(category))
                    Text(category.displayName)
                        .font(.headline)
                    Spacer()
                    Text("\(milestones.filter(\.isCompleted).count)/\(milestones.count)")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.secondary)
                }
                .padding(.top, Theme.Spacing.md)
            }
        }
    }

    private var filteredCategories: [(MilestoneCategory, [Milestone])] {
        if let filter = selectedFilter {
            return viewModel.milestonesByCategory.filter { $0.0 == filter }
        }
        return viewModel.milestonesByCategory
    }

    private func categoryColor(_ category: MilestoneCategory) -> Color {
        switch category {
        case .housing: return .blue
        case .finance: return .green
        case .logistics: return .orange
        case .admin: return .purple
        }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "calendar.badge.plus")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("No milestones yet")
                .font(.headline)
            Text("Go to the Home tab and complete your move plan to generate your personalized timeline.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(Theme.Spacing.xxl)
    }
}

struct StatCard: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: Theme.Spacing.xs) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
            Text(value)
                .font(.title3.weight(.bold).monospacedDigit())
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .cardStyle()
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.medium))
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.vertical, Theme.Spacing.sm)
                .background(isSelected ? Theme.accent : Theme.secondaryBackground)
                .foregroundStyle(isSelected ? .white : .primary)
                .clipShape(Capsule())
        }
    }
}
