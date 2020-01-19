aws configure set aws_access_key_id AKIAJNOSBDWNBGG5GCDQ
aws configure set aws_secret_access_key 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
aws configure set region us-west-1


aws s3 rm s3://imagekeypair --recursive

Active_Worker_Instance_JSON=$(aws ec2 run-instances --image-id ami-3f42535f --count 1 --instance-type t2.micro --key-name shanky_delete_this --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Active-Worker}]')
Web_Instance_Id=$(aws ec2 run-instances --image-id ami-7e43521e --count 1 --instance-type t2.micro --key-name CSE546-ML --security-group-ids sg-043c627d --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Web-Server}]')

sleep 50s
Web_Tier_Public_IP=$(aws ec2 describe-instances --filter Name=tag:Name,Values=Web-Server | grep PublicIpAddress | awk -F ":" '{print $2}' | sed 's/[",]//g')
echo $Web_Tier_Public_IP


