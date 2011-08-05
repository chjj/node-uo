# node-uo

A UO server written entirely in node. It's a work in progress and very messy 
right now. The packet interpreter is done for the most part. The dispatcher 
and packet builder are still being written. After that comes the actual game 
logic.

It is ultimately intended to be accurate to one of the earlier eras of UO. I 
don't plan on making it compatible with client versions >= 6.0.0.

If I manage to finish this, it should, at the very least, be a good experiment 
to see how well node can handle a complex MMO over tcp.