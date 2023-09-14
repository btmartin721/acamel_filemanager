#!/bin/zsh

rm align/test*(N)

python file_watchdog.py &
PID=$!

sleep 4

touch align/test4.vcf
mv align/test4.vcf align/test5.vcf
echo "This is a test" >> align/test5.vcf

touch align/test6.vcf
rm align/test6.vcf

sleep 4

kill $PID
