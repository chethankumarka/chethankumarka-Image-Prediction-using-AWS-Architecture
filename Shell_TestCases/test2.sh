#!/bin/bash
echo ./test2.sh [IP_address] [sleep_time] [total_requests]
n=${3}
RANDOM=1414
while [ $n -gt 0 ]
do

concurrent=$(($RANDOM%35+1))
if [ $concurrent -gt $n ]
        then
                echo $n
                ./test.sh ${1} $n $n
                n=0
else
        echo $concurrent
        ./test.sh ${1} $concurrent $concurrent
        n=$(($n-$concurrent))
fi

sleep ${2}s

done
