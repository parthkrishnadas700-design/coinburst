package com.coinburst.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetPlugin")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        String netProfit = call.getString("netProfit", "+$0.00");
        String totalIncome = call.getString("totalIncome", "+$0.00");
        String totalExpense = call.getString("totalExpense", "-$0.00");
        String status = call.getString("status", "PROFIT SURPLUS");
        Boolean isProfit = call.getBoolean("isProfit", true);

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("CoinBurstWidgetData", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("netProfit", netProfit);
        editor.putString("totalIncome", totalIncome);
        editor.putString("totalExpense", totalExpense);
        editor.putString("status", status);
        editor.putBoolean("isProfit", isProfit != null ? isProfit : true);
        editor.apply();

        // Broadcast update to all active AppWidgets on home screen
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
        int[] ids = widgetManager.getAppWidgetIds(new ComponentName(context, ProfitLossWidgetProvider.class));
        
        Intent intent = new Intent(context, ProfitLossWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
