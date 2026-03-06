import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import type { BudgetItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BudgetOverviewProps {
  items: BudgetItem[];
}

/** Budget breakdown showing estimated cost ranges by category. */
export function BudgetOverview({ items }: BudgetOverviewProps) {
  const totalLow = items.reduce((sum, item) => sum + item.estimatedLow, 0);
  const totalHigh = items.reduce((sum, item) => sum + item.estimatedHigh, 0);

  const grouped = items.reduce<Record<string, BudgetItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budget Overview</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Estimated Total</p>
          <p className="mt-1 text-2xl font-bold">
            {formatCurrency(totalLow)} – {formatCurrency(totalHigh)}
          </p>
        </div>

        {Object.entries(grouped).map(([category, categoryItems]) => {
          const catLow = categoryItems.reduce((s, i) => s + i.estimatedLow, 0);
          const catHigh = categoryItems.reduce((s, i) => s + i.estimatedHigh, 0);

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">{category}</h4>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(catLow)} – {formatCurrency(catHigh)}
                </span>
              </div>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm bg-muted/30"
                  >
                    <div>
                      <span>{item.label}</span>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 ml-4 text-muted-foreground">
                      {formatCurrency(item.estimatedLow)} –{" "}
                      {formatCurrency(item.estimatedHigh)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <p className="text-xs text-muted-foreground text-center">
          These are informational estimates, not financial projections.
        </p>
      </CardContent>
    </Card>
  );
}
