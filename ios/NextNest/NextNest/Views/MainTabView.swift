import SwiftUI

/// Main tab bar navigation for the authenticated experience.
struct MainTabView: View {
    @StateObject private var dashboardVM = DashboardViewModel()
    @State private var selectedTab = 0

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            TabView(selection: $selectedTab) {
                DashboardView(viewModel: dashboardVM)
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)

            TimelineView(viewModel: dashboardVM)
                .tabItem {
                    Label("Timeline", systemImage: "calendar.badge.clock")
                }
                .tag(1)

            NavigationStack {
                AIChatView()
            }
            .tabItem {
                Label("AI Advisor", systemImage: "sparkles")
            }
            .tag(2)

            BudgetTabView(viewModel: dashboardVM)
                .tabItem {
                    Label("Budget", systemImage: "dollarsign.circle.fill")
                }
                .tag(3)

            SettingsView()
                .tabItem {
                    Label("More", systemImage: "ellipsis.circle.fill")
                }
                .tag(4)
            }
        }
    }
}

/// Budget tab with segmented navigation between estimates, expenses, and quotes.
struct BudgetTabView: View {
    @ObservedObject var viewModel: DashboardViewModel
    @State private var selectedSegment = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("View", selection: $selectedSegment) {
                    Text("Estimates").tag(0)
                    Text("Expenses").tag(1)
                    Text("Quotes").tag(2)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, Theme.Spacing.md)
                .padding(.top, Theme.Spacing.sm)
                .padding(.bottom, Theme.Spacing.xs)

                Group {
                    switch selectedSegment {
                    case 1: ExpensesView()
                    case 2: QuotesView()
                    default: BudgetView(viewModel: viewModel)
                    }
                }
            }
            .navigationTitle(segmentTitle)
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private var segmentTitle: String {
        switch selectedSegment {
        case 1: return "Expenses"
        case 2: return "Quotes"
        default: return "Budget"
        }
    }
}
