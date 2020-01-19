#!/bin/bash
    array[10]="airplane"
    array[1]="automobile"
    array[2]="bird"
    array[3]="cat"
    array[4]="deer"
    array[5]="dog"
    array[6]="frog"
    array[7]="horse"
    array[8]="ship"
    array[9]="truck"

function generate(){
    n=1
    RANDOM=$1
    while [ $n -le $3 ];do
        sortnumber=$(($RANDOM%10+1))
        number=$(($RANDOM%9999+0))
        http="http://visa.lab.asu.edu/cifar-10/"$number"_"${array[$sortnumber]}".png"
        wget --spider -q -o /dev/null  --tries=1 -T 5 $http
            if [ $? -eq 0 ]
                then
                    let n++
                    project1="http://"$2"/cloudimagerecognition?input="$http
                    curl $project1
            fi
    done
}

function fork(){
        count=1;
        echo $1
        while [ "$count" -le "$1" ]
        do
                generate $(($base+$count)) $2 $3&
           
                count=$(( count+1 ))
        done
   }
   base=1213
if [ !${1} ]
then
echo ./test.sh [IP_address] [concurrent_requests_number] [total_requests_number]
fi
   s=$((${3}/${2}))
 
   fork ${2} ${1} $s

    exit 0


