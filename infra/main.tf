resource "google_project" "thefinalcountdown_b6dfc" {
  billing_account     = "012663-5C16BD-BD7E53"
  auto_create_network = true
  labels = {
    firebase        = "enabled"
    firebase-core   = "disabled"
    managed-by-cnrm = "true"
  }
  name       = "TheFinalCountdown"
  project_id = "thefinalcountdown-b6dfc"
}
resource "google_logging_project_sink" "a_required" {
  destination            = "logging.googleapis.com/projects/thefinalcountdown-b6dfc/locations/global/buckets/_Required"
  filter                 = "LOG_ID(\"cloudaudit.googleapis.com/activity\") OR LOG_ID(\"externalaudit.googleapis.com/activity\") OR LOG_ID(\"cloudaudit.googleapis.com/system_event\") OR LOG_ID(\"externalaudit.googleapis.com/system_event\") OR LOG_ID(\"cloudaudit.googleapis.com/access_transparency\") OR LOG_ID(\"externalaudit.googleapis.com/access_transparency\")"
  name                   = "_Required"
  project                = "694566387672"
  unique_writer_identity = true
}
resource "google_project_service" "cloudapis_googleapis_com" {
  project = "694566387672"
  service = "cloudapis.googleapis.com"
}
resource "google_project_service" "firebaseinstallations_googleapis_com" {
  project = "694566387672"
  service = "firebaseinstallations.googleapis.com"
}
resource "google_project_service" "firebase_googleapis_com" {
  project = "694566387672"
  service = "firebase.googleapis.com"
}
resource "google_project_service" "cloudresourcemanager_googleapis_com" {
  project = "694566387672"
  service = "cloudresourcemanager.googleapis.com"
}
resource "google_logging_project_sink" "a_default" {
  destination            = "logging.googleapis.com/projects/thefinalcountdown-b6dfc/locations/global/buckets/_Default"
  filter                 = "NOT LOG_ID(\"cloudaudit.googleapis.com/activity\") AND NOT LOG_ID(\"externalaudit.googleapis.com/activity\") AND NOT LOG_ID(\"cloudaudit.googleapis.com/system_event\") AND NOT LOG_ID(\"externalaudit.googleapis.com/system_event\") AND NOT LOG_ID(\"cloudaudit.googleapis.com/access_transparency\") AND NOT LOG_ID(\"externalaudit.googleapis.com/access_transparency\")"
  name                   = "_Default"
  project                = "694566387672"
  unique_writer_identity = true
}
resource "google_project_service" "identitytoolkit_googleapis_com" {
  project = "694566387672"
  service = "identitytoolkit.googleapis.com"
}
resource "google_project_service" "firebaserules_googleapis_com" {
  project = "694566387672"
  service = "firebaserules.googleapis.com"
}
resource "google_project_service" "serviceusage_googleapis_com" {
  project = "694566387672"
  service = "serviceusage.googleapis.com"
}
resource "google_project_service" "storage_component_googleapis_com" {
  project = "694566387672"
  service = "storage-component.googleapis.com"
}
resource "google_project_service" "firestore_googleapis_com" {
  project = "694566387672"
  service = "firestore.googleapis.com"
}
resource "google_project_service" "firebasehosting_googleapis_com" {
  project = "694566387672"
  service = "firebasehosting.googleapis.com"
}
resource "google_project_service" "storage_googleapis_com" {
  project = "694566387672"
  service = "storage.googleapis.com"
}
resource "google_project_service" "storage_api_googleapis_com" {
  project = "694566387672"
  service = "storage-api.googleapis.com"
}
resource "google_project_service" "monitoring_googleapis_com" {
  project = "694566387672"
  service = "monitoring.googleapis.com"
}
resource "google_project_service" "securetoken_googleapis_com" {
  project = "694566387672"
  service = "securetoken.googleapis.com"
}
resource "google_project_service" "servicemanagement_googleapis_com" {
  project = "694566387672"
  service = "servicemanagement.googleapis.com"
}
resource "google_project_service" "logging_googleapis_com" {
  project = "694566387672"
  service = "logging.googleapis.com"
}
