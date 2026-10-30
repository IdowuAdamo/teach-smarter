terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. S3 Storage for Uploaded Gradebooks
resource "aws_s3_bucket" "uploads" {
  bucket = "${var.app_name}-uploads-${var.environment}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads_encryption" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "uploads_block" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2. RDS PostgreSQL (Multi-Tenant Isolated)
resource "aws_db_instance" "postgres" {
  identifier           = "${var.app_name}-db-${var.environment}"
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = "db.t4g.micro"
  db_name              = "teachsmarter"
  username             = "postgres"
  password             = var.db_password
  skip_final_snapshot  = true
  publicly_accessible  = false
  storage_encrypted    = true
}

# 3. SQS Queue for Approval Tokens (Wait for task token)
resource "aws_sqs_queue" "approval_queue" {
  name                      = "${var.app_name}-approvals-${var.environment}"
  message_retention_seconds = 604800 # 7 days
}

# 4. Amazon SES Email Identity
resource "aws_ses_email_identity" "sender" {
  email = var.ses_sender_email
}

