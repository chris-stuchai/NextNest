import SwiftUI

/// Expense tracking — manual entry and category breakdown.
struct ExpensesView: View {
    @EnvironmentObject private var haptics: HapticManager
    @State private var expenses: [Expense] = []
    @State private var isLoading = true
    @State private var showAddSheet = false
    @State private var error: String?

    var totalSpent: Double { expenses.reduce(0) { $0 + $1.amountDollars } }

    var expensesByCategory: [(String, [Expense])] {
        Dictionary(grouping: expenses, by: \.category)
            .sorted { $0.key < $1.key }
    }

    var body: some View {
        Group {
            if isLoading {
                ProgressView()
            } else if expenses.isEmpty {
                emptyState
            } else {
                expenseList
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { showAddSheet = true } label: {
                    Image(systemName: "plus.circle.fill").font(.title3)
                }
            }
        }
        .sheet(isPresented: $showAddSheet) {
            AddExpenseSheet { await loadExpenses() }
        }
        .task { await loadExpenses() }
    }

    private var expenseList: some View {
        List {
            Section {
                VStack(spacing: Theme.Spacing.xs) {
                    Text("Total Spent")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(formatCurrency(totalSpent))
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                    Text("\(expenses.count) expenses")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .frame(maxWidth: .infinity)
                .listRowBackground(Color.clear)
            }

            ForEach(expensesByCategory, id: \.0) { category, items in
                Section {
                    ForEach(items) { expense in
                        ExpenseRow(expense: expense)
                    }
                    .onDelete { offsets in
                        Task {
                            for idx in offsets {
                                await deleteExpense(items[idx])
                            }
                        }
                    }
                } header: {
                    HStack {
                        Text(category.capitalized)
                        Spacer()
                        Text(formatCurrency(items.reduce(0) { $0 + $1.amountDollars }))
                            .foregroundStyle(Theme.accent)
                    }
                }
            }
        }
        .refreshable { await loadExpenses() }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: "creditcard")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)
            Text("No expenses tracked")
                .font(.headline)
            Text("Tap + to add your first moving expense.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Button("Add Expense") { showAddSheet = true }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
        }
        .padding(Theme.Spacing.xxl)
    }

    private func loadExpenses() async {
        do {
            expenses = try await APIClient.shared.fetchExpenses()
            isLoading = false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
        }
    }

    private func deleteExpense(_ expense: Expense) async {
        haptics.impact()
        expenses.removeAll { $0.id == expense.id }
        do { try await APIClient.shared.deleteExpense(id: expense.id) }
        catch { await loadExpenses() }
    }

    private func formatCurrency(_ value: Double) -> String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.maximumFractionDigits = 2
        return f.string(from: NSNumber(value: value)) ?? "$\(value)"
    }
}

struct ExpenseRow: View {
    let expense: Expense

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(expense.name).font(.subheadline)
                Text(formattedDate).font(.caption).foregroundStyle(.tertiary)
            }
            Spacer()
            Text(expense.formattedAmount)
                .font(.subheadline.weight(.medium).monospacedDigit())
        }
    }

    private var formattedDate: String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let date = f.date(from: expense.date) else { return expense.date }
        f.dateFormat = "MMM d"
        return f.string(from: date)
    }
}

struct AddExpenseSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var haptics: HapticManager
    let onSave: () async -> Void

    @State private var name = ""
    @State private var amount = ""
    @State private var category = "Moving"
    @State private var date = Date()
    @State private var notes = ""
    @State private var isSaving = false
    @State private var error: String?

    let categories = ["Moving", "Housing", "Travel", "Utilities", "Admin", "Other"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Expense name", text: $name)
                    TextField("Amount ($)", text: $amount)
                        .keyboardType(.decimalPad)
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { Text($0) }
                    }
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }
                Section("Notes") {
                    TextField("Optional notes", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                }
                if let error {
                    Section {
                        Text(error).foregroundStyle(.red).font(.caption)
                    }
                }
            }
            .navigationTitle("Add Expense")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(name.isEmpty || amount.isEmpty || isSaving)
                }
            }
        }
    }

    private func save() async {
        isSaving = true
        error = nil
        let amountCents = Int((Double(amount) ?? 0) * 100)
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        let req = ExpenseRequest(
            name: name, amount: amountCents,
            category: category, date: f.string(from: date),
            notes: notes.isEmpty ? nil : notes
        )
        do {
            _ = try await APIClient.shared.addExpense(req)
            haptics.success()
            await onSave()
            dismiss()
        } catch {
            self.error = error.localizedDescription
            isSaving = false
        }
    }
}
