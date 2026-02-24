terraform {
  backend "gcs" {
    bucket = "personal-terraform-gcp-infra"
    prefix = "terraform/thefinalcountdown"
  }
}