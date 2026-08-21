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

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        String netProfit = call.getString("netProfit", "$0.00");
        String income = call.getString("income", "$0.00");
        String expense = call.getString("expense", "$0.00");
        String status = call.getString("status", "BALANCED");
        boolean isProfit = call.getBoolean("isProfit", true);

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("CoinBurstWidgetData", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("net_profit", netProfit);
        editor.putString("income", income);
        editor.putString("expense", expense);
        editor.putString("status", status);
        editor.putBoolean("is_profit", isProfit);
        editor.apply();

        // Broadcast intent to update all active Android Home Screen App Widgets
        Intent intent = new Intent(context, ProfitLossWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(context).getAppWidgetIds(
                new ComponentName(context, ProfitLossWidgetProvider.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
