<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LmsCourse extends Model
{
    use HasFactory;

    protected $table = 'lms_courses';

    protected $fillable = [
        'moodle_id',
        'category_id',
        'fullname',
        'shortname',
        'visible',
    ];

    protected $casts = [
        'moodle_id' => 'integer',
        'category_id' => 'integer',
        'visible' => 'boolean',
    ];

    public function cohorts(): HasMany
    {
        return $this->hasMany(LmsCohort::class, 'course_id');
    }
}

