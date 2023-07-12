FROM timberio/vector:0.31.X-debian

ADD entrypoint.sh /entrypoint.sh
ADD ./secrets/ /secrets/
ADD ./vector/ /etc/vector/

ENTRYPOINT [ "/entrypoint.sh" ]
