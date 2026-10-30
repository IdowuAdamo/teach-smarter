output "s3_bucket_name" {
  value = aws_s3_bucket.uploads.bucket
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "approval_queue_url" {
  value = aws_sqs_queue.approval_queue.url
}

