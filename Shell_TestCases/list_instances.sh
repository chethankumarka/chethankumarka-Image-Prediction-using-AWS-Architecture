#data point interval for cpu utilization
echo please configure the aws setting before running this script.
while [ true ];do
echo start counting
number=0
INTERVAL=60
INSID=$(aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId]'	\
		--filters Name=instance-state-name,Values=running --output text)
IDVEC=($INSID)

for i in ${IDVEC[@]}
do
	UTIL=$(aws cloudwatch get-metric-statistics --namespace AWS/EC2 --query 'Datapoints[*].[Average]' \
		--metric-name CPUUtilization  --period 300 --statistics Average	--output text\
		--dimensions Name=InstanceId,Value=$i \
		--start-time $(date -u "+%FT%T" -d "${INTERVAL} min ago") --end-time $(date -u "+%FT%T"))
	UTILVEC=($UTIL)
	UTIL=0
	k=0
	for j in ${UTILVEC[@]}
	do
		UTIL=$(python -c "print $UTIL + $j")
		k=$(python -c "print $k + 1")
	done
	if [[ k -ne 0 ]]
	then
		UTIL=$(python -c "print $UTIL / $k")
                let number++
		echo instanceID[$i]	CPUUtilization[$UTIL]
	else
                let number++
		echo instanceID[$i] is being initialized, and does not have valid data point now.
	fi
done
echo Total: $number
done
