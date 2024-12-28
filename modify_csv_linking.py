with open("mc_tsd.csv","r",encoding="utf-8") as mc_tsd_csv_file:
    mc_tsd_csv_cols = list(zip(*list(map(lambda x: x.split(","), mc_tsd_csv_file.read().split("\n")))))
with open("mc_tsd_nohole.csv","r",encoding="utf-8") as mc_tsd_nohole_csv_file:
    mc_tsd_nohole_csv_cols = list(zip(*list(map(lambda x: x.split(","), mc_tsd_nohole_csv_file.read().split("\n")))))
with open("tsd_nohole.csv","r",encoding="utf-8") as tsd_nohole_csv_file:
    tsd_nohole_csv_cols = list(zip(*list(map(lambda x: x.split(","), tsd_nohole_csv_file.read().split("\n")))))
with open("tsd.csv","r",encoding="utf-8") as tsd_csv_file:
    tsd_csv_cols = list(zip(*list(map(lambda x: x.split(","), tsd_csv_file.read().split("\n")))))

mc_tsd_nohole_csv_cols_resolved = [[j for j in i] for i in mc_tsd_nohole_csv_cols]
mc_tsd_csv_cols_resolved = [[j for j in i] for i in mc_tsd_csv_cols]

for ri,c in enumerate(mc_tsd_nohole_csv_cols[2:]):
    i = ri + 2
    for rj,v in enumerate(c[1:]):
        j = rj + 1
        if v: mc_tsd_nohole_csv_cols_resolved[i][j] = tsd_nohole_csv_cols[3][int(v)+1]

for ri,c in enumerate(mc_tsd_csv_cols[2:]):
    i = ri + 2
    for rj,v in enumerate(c[1:]):
        j = rj + 1
        if v: mc_tsd_csv_cols_resolved[i][j] = tsd_csv_cols[3][int(v)+1]

with open("mc_tsd_nohole_resolved.csv","w",encoding="utf-8") as file1:
    file1.write("\n".join(list(map(lambda x: ",".join(x), list(zip(*mc_tsd_nohole_csv_cols_resolved))))))

with open("mc_tsd_resolved.csv","w",encoding="utf-8") as file2:
    file2.write("\n".join(list(map(lambda x: ",".join(x), list(zip(*mc_tsd_csv_cols_resolved))))))

