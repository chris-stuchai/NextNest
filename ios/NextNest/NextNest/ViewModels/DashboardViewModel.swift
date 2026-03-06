import Foundation
import SwiftUI

/// Shared view model for dashboard, timeline, and budget screens.
@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var dashboardData: DashboardData?
    @Published var isLoading = false
    @Published var error: String?
    @Published var needsIntake = false

    var plan: RelocationPlan? { dashboardData?.plan }
    var milestones: [Milestone] { dashboardData?.milestones ?? [] }
    var budgetItems: [BudgetItem] { dashboardData?.budgetItems ?? [] }
    var intake: IntakeResponse? { dashboardData?.intake }
    var daysUntilMove: Int { dashboardData?.daysUntilMove ?? 0 }
    var readinessScore: Int { plan?.readinessScore ?? 0 }

    var completedMilestones: Int { milestones.filter(\.isCompleted).count }
    var totalMilestones: Int { milestones.count }
    var milestoneProgress: Double {
        totalMilestones > 0 ? Double(completedMilestones) / Double(totalMilestones) : 0
    }

    var totalBudgetLow: Double {
        budgetItems.reduce(0) { $0 + Double($1.estimatedLow) / 100.0 }
    }
    var totalBudgetHigh: Double {
        budgetItems.reduce(0) { $0 + Double($1.estimatedHigh) / 100.0 }
    }

    var milestonesByCategory: [(MilestoneCategory, [Milestone])] {
        let grouped = Dictionary(grouping: milestones, by: \.category)
        return MilestoneCategory.allCases.compactMap { cat in
            guard let items = grouped[cat], !items.isEmpty else { return nil }
            return (cat, items.sorted { $0.sortOrder < $1.sortOrder })
        }
    }

    var budgetByCategory: [(String, [BudgetItem])] {
        let grouped = Dictionary(grouping: budgetItems, by: \.category)
        return grouped.sorted { $0.key < $1.key }
    }

    func loadDashboard() async {
        isLoading = true
        error = nil
        needsIntake = false
        defer { isLoading = false }
        do {
            dashboardData = try await APIClient.shared.fetchDashboard()
        } catch APIError.notFound {
            needsIntake = true
        } catch APIError.unauthorized {
            error = "Session expired. Please sign in again."
        } catch {
            self.error = error.localizedDescription
        }
    }

    func toggleMilestone(_ milestone: Milestone) async {
        guard let currentPlan = plan else { return }

        let newValue = !milestone.isCompleted
        if let idx = dashboardData?.milestones.firstIndex(where: { $0.id == milestone.id }) {
            dashboardData?.milestones[idx].isCompleted = newValue
        }
        do {
            let result = try await APIClient.shared.toggleMilestone(id: milestone.id, isCompleted: newValue)
            if let idx = dashboardData?.milestones.firstIndex(where: { $0.id == milestone.id }) {
                dashboardData?.milestones[idx] = result.milestone
            }
            dashboardData?.plan = RelocationPlan(
                id: currentPlan.id, userId: currentPlan.userId,
                targetDate: currentPlan.targetDate, readinessScore: result.readinessScore,
                planConfig: currentPlan.planConfig,
                createdAt: currentPlan.createdAt, updatedAt: currentPlan.updatedAt
            )
        } catch {
            if let idx = dashboardData?.milestones.firstIndex(where: { $0.id == milestone.id }) {
                dashboardData?.milestones[idx].isCompleted = !newValue
            }
        }
    }
}
