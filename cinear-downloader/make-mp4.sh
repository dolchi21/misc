cat ts-files/*.ts > all.ts
rm ts-files/*.ts
#ffmpeg -i all.ts -acodec copy -vcodec copy all.mp4
#rm all.mp4
ffmpeg -i all.ts -bsf:a aac_adtstoasc -acodec copy -vcodec copy all.mp4
rm all.ts