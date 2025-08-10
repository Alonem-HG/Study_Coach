package com.tuempresa.studycoach;

import android.os.Bundle;
import android.webkit.WebView;
import android.content.pm.ApplicationInfo;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // permitir audio sin gesto del usuario
    try {
      getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
    } catch (Exception ignored) {}

    // desactivar debugging de WebView en release
    boolean isDebuggable = (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    if (!isDebuggable) {
      WebView.setWebContentsDebuggingEnabled(false);
    }
  }
}
