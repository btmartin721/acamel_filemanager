#!/bin/bash
#SBATCH --job-name=job_name
#SBATCH --partition condo
#SBATCH --qos condo
#SBATCH --constraint='douglas&256gb'
#SBATCH --output=R-%x.%j.slurm
#SBATCH --error=R-%x.%j.err
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=16
#SBATCH --time=72:00:00

# Load any modules you need here.
module purge; module load gcc/10.2.1 python/3.11-anaconda

# Change to submit directory.
cd $SLURM_SUBMIT_DIR

### Activate environment here ###
conda activate myenv

nohup python ile_watchdog.py &

rsync -avh ./dataprep /scratch/${SLURM_JOB_ID}/
rsync -avh ./analysis /scratch/${SLURM_JOB_ID}/
rsync -avh ./align /scratch/${SLURM_JOB_ID}/

cd /scratch/${SLURM_JOB_ID}/

#### RUN ANY CODE OR SCRIPTS HERE ###

rsync -avh /scratch/${SLURM_JOB_ID}/analysis $SLURM_SUBMIT_DIR/
rsync -avh /scratch/${SLURM_JOB_ID}/align $SLURM_SUBMIT_DIR/
rsync -avh /scratch/${SLURM_JOB_ID}/dataprep $SLURM_SUBMIT_DIR/

conda deactivate

kill `lsof nohup.out | awk '{print $2}' | grep -v "PID" | sort | uniq`

exit 0

