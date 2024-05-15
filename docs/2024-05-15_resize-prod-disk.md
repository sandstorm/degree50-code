# How to Resize the Production Disk
> !!! WARNING: IF YOU RESIZE THE DISK TO A SMALLER SIZE, YOU WILL MOST LIKELY LOOSE DATA !!!
> 
> MAKE SURE YOU HAVE A BACKUP!

## WHY
When disk space is full, we need to resize the disk to accommodate more data.
The IT-Team of TU-Dortmund provides more disk space, which is not automatically
added to the disk. We need to resize the disk manually.

## HOW
1. Check the disk space `df -h`
2. Resize data partition or create new `cfdisk`
   - Here you can see your partitions in a terminal-based GUI
   - Select the partition you want to resize and give it the space you want
3. resize physical volume
   - `pvdisplay` to see the physical volumes
   - `pvresize <data-partition>` to resize the physical volume (e.g. `pvresize /dev/sda4`)
4. resize logical volume
   - `lvdisplay` to see the logical volumes
   - `lvextend -l +100%FREE <data-volume>` to extend the logical volume with all free space (e.g. `lvextend -l +100%FREE /dev/vg00/data`)
5. resize filesystem
   - `resize2fs <data-fs>` to resize the filesystem (e.g. `resize2fs /dev/mapper/vg00-data`)
