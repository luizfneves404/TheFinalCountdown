variable "project_id" {
  type        = string
  description = "GCP project id."
}

variable "region" {
  type        = string
  description = "Default region for regional resources."
  default     = "us-central1"
}

variable "tf_state_bucket_name" {
  type        = string
  description = "Globally-unique name for the Terraform state bucket."
}

variable "tf_state_bucket_location" {
  type        = string
  description = "Bucket location (region like us-central1 or multi-region like US)."
  default     = "US"
}

variable "labels" {
  type        = map(string)
  description = "Labels applied to managed resources."
  default     = {}
}

