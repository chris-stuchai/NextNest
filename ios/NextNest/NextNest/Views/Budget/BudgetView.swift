import SwiftUI

/// Budget overview with cost breakdown by category and budget editing.
struct BudgetView: View {
    @ObservedObject var viewModel: DashboardViewModel
    @EnvironmentObject private var haptics: HapticManager
    @State private var showBudgetEditor = false

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.dashboardData == nil {
                ProgressView()
            } else if viewModel.budgetItems.isEmpty {
                emptyState
            } else {
                budgetContent
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showBudgetEditor = true
                } label: {
                    Image(systemName: "slider.horizontal.3").font(.body)
                }
            }
        }
        .sheet(isPresented: $showBudgetEditor) {
            BudgetEditorSheet()
        }
    }

    private var budgetContent: some View {
        ScrollView {
            LazyVStack(spacing: Theme.Spacing.md) {
                totalCard
                categoryBreakdown
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.bottom, Theme.Spacing.xxl)
        }
        .refreshable {
            haptics.tap()
            await viewModel.loadDashboard()
        }
    }

    private var totalCard: some View {
        VStack(spacing: Theme.Spacing.sm) {
            Text("Estimated Total")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.xs) {
                Text(formatCurrency(viewModel.totalBudgetLow))
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                Text("–")
                    .foregroundStyle(.secondary)
                Text(formatCurrency(viewModel.totalBudgetHigh))
                    .font(.system(size: 28, weight: .bold, design: .rounded))
            }
            Text("\(viewModel.budgetItems.count) line items")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity)
        .cardStyle()
    }

    private var categoryBreakdown: some View {
        ForEach(viewModel.budgetByCategory, id: \.0) { category, items in
            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                HStack {
                    Image(systemName: categoryIcon(category))
                        .foregroundStyle(Theme.accent)
                    Text(category.capitalized)
                        .font(.headline)
                    Spacer()
                    let catTotal = items.reduce(0.0) { $0 + $1.midEstimate }
                    Text(formatCurrency(catTotal))
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Theme.accent)
                }
                ForEach(items) { item in
                    BudgetItemRow(item: item)
                }
            }
            .cardStyle()
        }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "dollarsign.circle")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("No budget data yet")
                .font(.headline)
            Text("Go to the Home tab and complete your move plan for a personalized cost estimate.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(Theme.Spacing.xxl)
    }

    private func formatCurrency(_ value: Double) -> String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.maximumFractionDigits = 0
        return f.string(from: NSNumber(value: value)) ?? "$\(Int(value))"
    }

    private func categoryIcon(_ category: String) -> String {
        switch category.lowercased() {
        case "moving": return "shippingbox.fill"
        case "housing": return "house.fill"
        case "travel": return "airplane"
        case "utilities": return "bolt.fill"
        case "admin": return "doc.text.fill"
        case "contingency": return "shield.fill"
        default: return "folder.fill"
        }
    }
}

struct BudgetItemRow: View {
    let item: BudgetItem

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(item.label).font(.subheadline)
                if let notes = item.notes, !notes.isEmpty {
                    Text(notes).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                }
            }
            Spacer()
            Text(item.formattedRange)
                .font(.caption.weight(.medium).monospacedDigit())
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, Theme.Spacing.xs)
    }
}

/// Sheet for editing the user's total budget and breakdown.
struct BudgetEditorSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var haptics: HapticManager

    @State private var totalBudget = ""
    @State private var housingBudget = ""
    @State private var movingBudget = ""
    @State private var travelBudget = ""
    @State private var emergencyFund = ""
    @State private var isSaving = false
    @State private var isLoading = true
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Total Budget") {
                    HStack {
                        Text("$")
                            .foregroundStyle(.secondary)
                        TextField("Total move budget", text: $totalBudget)
                            .keyboardType(.numberPad)
                    }
                }
                Section("Breakdown (optional)") {
                    BudgetField(label: "Housing", text: $housingBudget)
                    BudgetField(label: "Moving", text: $movingBudget)
                    BudgetField(label: "Travel", text: $travelBudget)
                    BudgetField(label: "Emergency Fund", text: $emergencyFund)
                }
                if let error {
                    Section { Text(error).foregroundStyle(.red).font(.caption) }
                }
                Section {
                    Text("Set your overall budget to track spending against your plan.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Set Budget")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(totalBudget.isEmpty || isSaving)
                        .fontWeight(.semibold)
                }
            }
            .task { await loadExisting() }
        }
    }

    private func loadExisting() async {
        do {
            if let budget = try await APIClient.shared.fetchBudget() {
                totalBudget = "\(budget.totalBudget / 100)"
                if let h = budget.housingBudget { housingBudget = "\(h / 100)" }
                if let m = budget.movingBudget { movingBudget = "\(m / 100)" }
                if let t = budget.travelBudget { travelBudget = "\(t / 100)" }
                if let e = budget.emergencyFund { emergencyFund = "\(e / 100)" }
            }
        } catch {}
        isLoading = false
    }

    private func save() async {
        isSaving = true
        error = nil
        let req = UserBudgetRequest(
            totalBudget: (Int(totalBudget) ?? 0) * 100,
            housingBudget: housingBudget.isEmpty ? nil : (Int(housingBudget) ?? 0) * 100,
            movingBudget: movingBudget.isEmpty ? nil : (Int(movingBudget) ?? 0) * 100,
            travelBudget: travelBudget.isEmpty ? nil : (Int(travelBudget) ?? 0) * 100,
            emergencyFund: emergencyFund.isEmpty ? nil : (Int(emergencyFund) ?? 0) * 100,
            notes: nil
        )
        do {
            _ = try await APIClient.shared.saveBudget(req)
            haptics.success()
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSaving = false
        }
    }
}

struct BudgetField: View {
    let label: String
    @Binding var text: String

    var body: some View {
        HStack {
            Text(label)
            Spacer()
            HStack(spacing: 2) {
                Text("$").foregroundStyle(.secondary)
                TextField("0", text: $text)
                    .keyboardType(.numberPad)
                    .multilineTextAlignment(.trailing)
                    .frame(width: 100)
            }
        }
    }
}
