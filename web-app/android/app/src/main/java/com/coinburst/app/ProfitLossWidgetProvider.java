package com.coinburst.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;

public class ProfitLossWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_profit_loss);

        // Fetch real-time values from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences("CoinBurstWidgetData", Context.MODE_PRIVATE);
        String netProfit = prefs.getString("net_profit", "$0.00");
        String income = prefs.getString("income", "$0.00");
        String expense = prefs.getString("expense", "$0.00");
        String status = prefs.getString("status", "BALANCED");
        boolean isProfit = prefs.getBoolean("is_profit", true);

        views.setTextViewText(R.id.widget_net_profit, netProfit);
        views.setTextViewText(R.id.widget_income, income);
        views.setTextViewText(R.id.widget_expense, expense);
        views.setTextViewText(R.id.widget_status_badge, status);

        if (isProfit) {
            views.setTextColor(R.id.widget_net_profit, Color.parseColor("#00FF88"));
            views.setTextColor(R.id.widget_status_badge, Color.parseColor("#00FF88"));
        } else {
            views.setTextColor(R.id.widget_net_profit, Color.parseColor("#FF007F"));
            views.setTextColor(R.id.widget_status_badge, Color.parseColor("#FF007F"));
        }

        // Click widget to launch app MainActivity
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.main_metrics, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
