<?php
header('Cache-Control: no-store');
header('X-LiteSpeed-Cache-Control: no-cache');
header('X-LiteSpeed-Purge: *');
echo "purged\n";
