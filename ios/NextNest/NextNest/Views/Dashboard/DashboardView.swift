import SwiftUI

/// Main dashboard with move countdown, readiness, quick actions, and priorities.
struct DashboardView: View {
    @ObservedObject var viewModel: DashboardViewModel
    @EnvironmentObject private var haptics: HapticManager

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background.ignoresSafeArea()
                Group {
                    if viewModel.needsIntake {
                        IntakeFlowView(onComplete: { await viewModel.loadDashboard() })
                    } else if let _ = viewModel.dashboardData {
                        dashboardContent
                    } else if let error = viewModel.error {
                        errorState(error)
                    } else {
                        loadingState
                    }
                }
                .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
            }
            .navigationTitle("NextNest")
            .navigationBarTitleDisplayMode(.large)
            .task { await viewModel.loadDashboard() }
        }
    }

    private var dashboardContent: some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.md) {
                routeHeader
                countdownCard
                statsRow
                readinessCard
                quickActions
                prioritiesSection
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .refreshable {
            haptics.tap()
            await viewModel.loadDashboard()
        }
    }

    private var routeHeader: some View {
        HStack(spacing: Theme.Spacing.sm) {
            VStack(alignment: .leading, spacing: 2) {
                Text("FROM")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
                Text(viewModel.intake?.movingFrom ?? "")
                    .font(.subheadline.weight(.medium))
            }
            Spacer()
            Image(systemName: "airplane")
                .font(.title2)
                .foregroundStyle(Theme.accent)
                .rotationEffect(.degrees(-30))
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("TO")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
                Text(viewModel.intake?.movingTo ?? "")
                    .font(.subheadline.weight(.medium))
            }
        }
        .cardStyle()
    }

    private var countdownCard: some View {
        VStack(spacing: Theme.Spacing.xs) {
            Text("\(viewModel.daysUntilMove)")
                .font(.system(size: 56, weight: .bold, design: .rounded))
                .foregroundStyle(Theme.accent)
                .contentTransition(.numericText())
            Text("days until your move")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            if let date = viewModel.plan?.targetDate {
                Text(formattedDate(date))
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.tertiary)
            }
        }
        .frame(maxWidth: .infinity)
        .cardStyle()
    }

    private var statsRow: some View {
        HStack(spacing: Theme.Spacing.sm) {
            MiniStat(
                value: "\(viewModel.readinessScore)%",
                label: "Ready",
                icon: "gauge.medium",
                color: Theme.accent
            )
            MiniStat(
                value: "\(viewModel.completedMilestones)/\(viewModel.totalMilestones)",
                label: "Done",
                icon: "checkmark.circle.fill",
                color: .green
            )
            MiniStat(
                value: formatBudget(viewModel.totalBudgetHigh),
                label: "Est. Cost",
                icon: "dollarsign.circle.fill",
                color: .orange
            )
        }
    }

    private var readinessCard: some View {
        VStack(spacing: Theme.Spacing.sm) {
            HStack {
                Text("Move Readiness")
                    .font(.headline)
                Spacer()
                Text("\(viewModel.readinessScore)%")
                    .font(.title3.weight(.bold).monospacedDigit())
                    .foregroundStyle(Theme.accent)
            }
            ProgressView(value: Double(viewModel.readinessScore), total: 100)
                .tint(Theme.accent)
                .scaleEffect(y: 2)
                .clipShape(Capsule())
        }
        .cardStyle()
    }

    private var quickActions: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Quick Actions")
                .font(.headline)
                .padding(.horizontal, Theme.Spacing.xs)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: Theme.Spacing.sm) {
                QuickActionButton(icon: "checklist", label: "Checklist", destination: AnyView(ChecklistView()))
                QuickActionButton(icon: "truck.box.fill", label: "Movers", destination: AnyView(MoversView()))
                QuickActionButton(icon: "phone.arrow.up.right", label: "Quotes", destination: AnyView(QuotesView()))
                QuickActionButton(icon: "doc.text.magnifyingglass", label: "Lease", destination: AnyView(LeaseView()))
                QuickActionButton(icon: "camera.fill", label: "Photos", destination: AnyView(PhotosView()))
                QuickActionButton(icon: "creditcard", label: "Expenses", destination: AnyView(ExpensesView()))
                QuickActionButton(icon: "map.fill", label: "Compare", destination: AnyView(NeighborhoodView()))
                QuickActionButton(icon: "sparkles", label: "AI Chat", destination: AnyView(AIChatView()))
            }
        }
    }

    private var prioritiesSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Up Next")
                .font(.headline)
                .padding(.horizontal, Theme.Spacing.xs)

            let upcoming = viewModel.milestones
                .filter { !$0.isCompleted }
                .sorted { $0.sortOrder < $1.sortOrder }
                .prefix(5)

            if upcoming.isEmpty {
                HStack {
                    Spacer()
                    VStack(spacing: Theme.Spacing.sm) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.largeTitle)
                            .foregroundStyle(Theme.accent)
                        Text("All caught up!")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                .cardStyle()
            } else {
                ForEach(Array(upcoming)) { milestone in
                    MilestoneRow(milestone: milestone) {
                        haptics.success()
                        await viewModel.toggleMilestone(milestone)
                    }
                }
            }
        }
    }

    private var loadingState: some View {
        VStack(spacing: Theme.Spacing.md) {
            ProgressView()
                .scaleEffect(1.5)
                .tint(Theme.accent)
            Text("Loading your plan...")
                .font(.body.weight(.medium))
                .foregroundStyle(.primary)
        }
        .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
        .background(Theme.secondaryBackground)
    }

    private func errorState(_ message: String) -> some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.largeTitle)
                .foregroundStyle(.orange)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button("Retry") { Task { await viewModel.loadDashboard() } }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
        }
        .padding(Theme.Spacing.xl)
    }

    private func formattedDate(_ dateString: String) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let date = f.date(from: dateString) else { return dateString }
        f.dateStyle = .long
        return f.string(from: date)
    }

    private func formatBudget(_ value: Double) -> String {
        if value >= 1000 {
            return "$\(Int(value / 1000))k"
        }
        return "$\(Int(value))"
    }
}

struct MiniStat: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: Theme.Spacing.xs) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(color)
            Text(value)
                .font(.subheadline.weight(.bold).monospacedDigit())
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .cardStyle()
    }
}

struct QuickActionButton: View {
    let icon: String
    let label: String
    let destination: AnyView

    var body: some View {
        NavigationLink {
            destination
        } label: {
            VStack(spacing: Theme.Spacing.xs) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(Theme.accent)
                Text(label)
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(.primary)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 72)
            .background(Theme.secondaryBackground)
            .clipShape(RoundedRectangle(cornerRadius: Theme.smallCornerRadius, style: .continuous))
        }
    }
}
