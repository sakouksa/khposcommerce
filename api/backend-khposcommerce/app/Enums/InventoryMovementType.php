<?php

namespace App\Enums;

enum InventoryMovementType: string
{
    case IN              = 'in';
    case OUT             = 'out';
    case TRANSFER_IN     = 'transfer_in';
    case TRANSFER_OUT    = 'transfer_out';
    case ADJUSTMENT      = 'adjustment';
    case OPNAME          = 'opname';
    case PURCHASE        = 'purchase';
    case PURCHASE_RETURN = 'purchase_return';
}
