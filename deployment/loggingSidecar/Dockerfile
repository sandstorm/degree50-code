FROM timberio/vector:0.14.X-debian

COPY --from=hairyhenderson/gomplate:v3.9.0 /gomplate /bin/gomplate

ADD entrypoint.sh /entrypoint.sh
ADD ./certificates/ /certificates/
ADD ./vector_template/ /etc/vector_template/

ENTRYPOINT [ "/entrypoint.sh" ]
