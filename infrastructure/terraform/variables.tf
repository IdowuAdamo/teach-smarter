variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (development, staging, production)"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "teachsmarter"
}

variable "db_password" {
  description = "PostgreSQL RDS master password"
  type        = string
  sensitive   = true
  default     = "ChangeMeInSecretsManager123!"
}

variable "ses_sender_email" {
  description = "Verified SES sender email address"
  type        = string
  default     = "notifications@teachsmarter.internal"
}

