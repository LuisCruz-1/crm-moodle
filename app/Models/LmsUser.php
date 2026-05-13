<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LmsUser extends Model
{
    use HasFactory;

    protected $table = 'lms_users';

    protected $fillable = [
        'moodle_id',
        'email',
        'username',
        'first_name',
        'last_name',
    ];

    protected $casts = [
        'moodle_id' => 'integer',
    ];
}

