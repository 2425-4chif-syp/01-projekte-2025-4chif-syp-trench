// Template für Environment-Konfiguration
// und passe die Werte entsprechend an
// anschließend das "template" aus dem namen environment."template".ts löschen

export const environment = {
  production: false, // Setze auf true für Production
  apiUrl: 'http://localhost:5127/api/', // Backend API URL
  apiKey: 'YOUR_API_KEY_HERE', // API-Key für Backend-Authentifizierung
  mqttWsUrl: 'ws://vm90.htl-leonding.ac.at:9001/ws',
  mqttUsername: 'student',
  mqttPassword: 'passme',
  mqttTopic: 'trench_mqtt_mock_v2/#',
  grafanaBaseUrl: 'http://localhost:3000',
  grafanaOrgId: 1,
  grafanaDashboardUid: 'trench-live',
  grafanaDashboardSlug: 'trench-live',
  grafanaSchenkelPanelId: 1
};
